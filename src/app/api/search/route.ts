import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const size = searchParams.get('size')
    const color = searchParams.get('color')
    const inStock = searchParams.get('inStock') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const autocomplete = searchParams.get('autocomplete') === 'true'

    // Se for autocomplete, retornar sugestões rápidas
    if (autocomplete && q.length >= 2) {
      return await getAutocompleteResults(q)
    }

    const skip = (page - 1) * limit

    // Construir filtros
    const whereClause: any = {
      active: true,
      AND: []
    }

    // Busca por texto
    if (q.trim()) {
      whereClause.AND.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } }
        ]
      })
    }

    // Filtro por categoria
    if (category) {
      whereClause.AND.push({
        category: { slug: category }
      })
    }

    // Filtro por preço
    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.gte = Number(minPrice)
      if (maxPrice) priceFilter.lte = Number(maxPrice)
      whereClause.AND.push({ basePrice: priceFilter })
    }

    // Filtro por tamanho
    if (size) {
      whereClause.AND.push({
        variants: {
          some: {
            size: size,
            ...(inStock && { stock: { gt: 0 } })
          }
        }
      })
    }

    // Filtro por cor
    if (color) {
      whereClause.AND.push({
        variants: {
          some: {
            color: color,
            ...(inStock && { stock: { gt: 0 } })
          }
        }
      })
    }

    // Filtro de estoque geral
    if (inStock && !size && !color) {
      whereClause.AND.push({
        variants: {
          some: {
            stock: { gt: 0 }
          }
        }
      })
    }

    // Filtro por produtos em destaque
    if (featured) {
      whereClause.AND.push({ featured: true })
    }

    // Se não houver filtros AND, remover o array vazio
    if (whereClause.AND.length === 0) {
      delete whereClause.AND
    }

    // Definir ordenação
    let orderBy: any = { createdAt: 'desc' }

    switch (sortBy) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' }
        break
      case 'price_desc':
        orderBy = { basePrice: 'desc' }
        break
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]
        break
      case 'popular':
        // Ordenar por mais vendidos (será calculado depois)
        orderBy = { createdAt: 'desc' }
        break
      default: // relevance
        if (q.trim()) {
          // Para relevância com busca, priorizar por nome primeiro
          orderBy = [
            { featured: 'desc' },
            { name: 'asc' },
            { createdAt: 'desc' }
          ]
        }
    }

    // Buscar produtos
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: {
            where: inStock ? { stock: { gt: 0 } } : undefined
          },
          reviews: {
            select: {
              rating: true
            }
          },
          ...(sortBy === 'popular' && {
            orderItems: {
              select: {
                quantity: true
              }
            }
          })
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ])

    // Se ordenação for por popularidade, ordenar pelos mais vendidos
    let sortedProducts = products
    if (sortBy === 'popular') {
      sortedProducts = products.sort((a, b) => {
        const aOrders = a.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
        const bOrders = b.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
        return bOrders - aOrders
      })
    }

    // Enriquecer dados dos produtos
    const enrichedProducts = sortedProducts.map(product => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      const hasStock = product.variants.length > 0 && product.variants.some(v => v.stock > 0)
      const minPrice = Math.min(Number(product.basePrice), ...product.variants.map(v => Number(v.price || product.basePrice)))
      const availableSizes = [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))]
      const availableColors = [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.color))]

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: Number(product.basePrice),
        minPrice,
        imageUrls: product.imageUrls,
        featured: product.featured,
        category: product.category,
        hasStock,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        availableSizes,
        availableColors,
        variantCount: product.variants.length
      }
    })

    // Buscar filtros disponíveis para a busca atual
    const filters = await getAvailableFilters(whereClause)

    return NextResponse.json({
      products: enrichedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters,
      query: {
        q,
        category,
        minPrice,
        maxPrice,
        size,
        color,
        inStock,
        featured,
        sortBy
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}

// Função para autocomplete
async function getAutocompleteResults(query: string) {
  try {
    const [products, categories] = await Promise.all([
      // Buscar produtos
      prisma.product.findMany({
        where: {
          active: true,
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrls: true,
          basePrice: true
        },
        take: 5,
        orderBy: [
          { featured: 'desc' },
          { name: 'asc' }
        ]
      }),
      // Buscar categorias
      prisma.category.findMany({
        where: {
          active: true,
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true
        },
        take: 3
      })
    ])

    return NextResponse.json({
      products: products.map(p => ({
        ...p,
        basePrice: Number(p.basePrice),
        type: 'product'
      })),
      categories: categories.map(c => ({
        ...c,
        type: 'category'
      })),
      query
    })
  } catch (error) {
    console.error('Error in autocomplete:', error)
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}

// Função para obter filtros disponíveis
async function getAvailableFilters(baseWhere: any) {
  try {
    const [categories, sizes, colors, priceRange] = await Promise.all([
      // Categorias disponíveis
      prisma.category.findMany({
        where: {
          active: true,
          products: {
            some: baseWhere
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: baseWhere
              }
            }
          }
        }
      }),
      // Tamanhos disponíveis
      prisma.productVariant.groupBy({
        by: ['size'],
        where: {
          stock: { gt: 0 },
          product: baseWhere
        },
        _count: {
          size: true
        },
        orderBy: {
          size: 'asc'
        }
      }),
      // Cores disponíveis
      prisma.productVariant.groupBy({
        by: ['color'],
        where: {
          stock: { gt: 0 },
          product: baseWhere
        },
        _count: {
          color: true
        },
        orderBy: {
          color: 'asc'
        }
      }),
      // Faixa de preços
      prisma.product.aggregate({
        where: baseWhere,
        _min: {
          basePrice: true
        },
        _max: {
          basePrice: true
        }
      })
    ])

    return {
      categories: categories.map(c => ({
        ...c,
        count: c._count.products
      })),
      sizes: sizes.map(s => ({
        value: s.size,
        count: s._count.size
      })),
      colors: colors.map(c => ({
        value: c.color,
        count: c._count.color
      })),
      priceRange: {
        min: Number(priceRange._min.basePrice) || 0,
        max: Number(priceRange._max.basePrice) || 0
      }
    }
  } catch (error) {
    console.error('Error getting filters:', error)
    return {
      categories: [],
      sizes: [],
      colors: [],
      priceRange: { min: 0, max: 0 }
    }
  }
}