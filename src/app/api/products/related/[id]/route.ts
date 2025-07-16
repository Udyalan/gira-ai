import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'RELATED'
    const limit = parseInt(searchParams.get('limit') || '8')

    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Buscar produtos relacionados manuais primeiro
    const manualRelations = await prisma.productRelation.findMany({
      where: {
        mainProductId: productId,
        relationType: type as any
      },
      include: {
        relatedProduct: {
          include: {
            category: true,
            variants: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' },
      take: limit
    })

    let relatedProducts = manualRelations.map(rel => rel.relatedProduct)

    // Se não tiver produtos manuais suficientes, buscar automaticamente
    if (relatedProducts.length < limit) {
      const remaining = limit - relatedProducts.length
      const existingIds = [productId, ...relatedProducts.map(p => p.id)]

      const automaticRelated = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          active: true,
          categoryId: product.categoryId, // Mesma categoria
          basePrice: {
            gte: Number(product.basePrice) * 0.7, // Faixa de preço similar
            lte: Number(product.basePrice) * 1.3
          }
        },
        include: {
          category: true,
          variants: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        take: remaining,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      relatedProducts = [...relatedProducts, ...automaticRelated]
    }

    // Se ainda não tiver suficientes, buscar por mais produtos populares
    if (relatedProducts.length < limit) {
      const remaining = limit - relatedProducts.length
      const existingIds = [productId, ...relatedProducts.map(p => p.id)]

      const popularProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          active: true
        },
        include: {
          category: true,
          variants: true,
          reviews: {
            select: {
              rating: true
            }
          },
          orderItems: {
            select: {
              quantity: true
            }
          }
        },
        take: remaining
      })

      // Ordenar por popularidade (mais vendidos)
      const popularSorted = popularProducts.sort((a, b) => {
        const aOrders = a.orderItems.reduce((sum, item) => sum + item.quantity, 0)
        const bOrders = b.orderItems.reduce((sum, item) => sum + item.quantity, 0)
        return bOrders - aOrders
      })

      relatedProducts = [...relatedProducts, ...popularSorted]
    }

    // Calcular dados extras para cada produto
    const enrichedProducts = relatedProducts.map(product => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      const hasStock = product.variants.some(variant => variant.stock > 0)
      const minPrice = Math.min(Number(product.basePrice), ...product.variants.map(v => Number(v.price || product.basePrice)))

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: Number(product.basePrice),
        minPrice,
        imageUrls: product.imageUrls,
        featured: product.featured,
        category: product.category,
        hasStock,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        variants: product.variants.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          price: v.price ? Number(v.price) : Number(product.basePrice)
        }))
      }
    })

    return NextResponse.json({
      products: enrichedProducts,
      type,
      total: enrichedProducts.length
    })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
  }
}

// Gerenciar produtos relacionados (Admin)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mainProductId = params.id
    const { relatedProductId, relationType = 'RELATED', order = 0 } = await request.json()

    if (!relatedProductId) {
      return NextResponse.json({ error: 'Related product ID is required' }, { status: 400 })
    }

    // Verificar se ambos os produtos existem
    const [mainProduct, relatedProduct] = await Promise.all([
      prisma.product.findUnique({ where: { id: mainProductId } }),
      prisma.product.findUnique({ where: { id: relatedProductId } })
    ])

    if (!mainProduct || !relatedProduct) {
      return NextResponse.json({ error: 'One or both products not found' }, { status: 404 })
    }

    // Criar relação
    const relation = await prisma.productRelation.upsert({
      where: {
        mainProductId_relatedProductId: {
          mainProductId,
          relatedProductId
        }
      },
      update: {
        relationType,
        order
      },
      create: {
        mainProductId,
        relatedProductId,
        relationType,
        order
      }
    })

    return NextResponse.json(relation, { status: 201 })
  } catch (error) {
    console.error('Error creating product relation:', error)
    return NextResponse.json({ error: 'Failed to create product relation' }, { status: 500 })
  }
}