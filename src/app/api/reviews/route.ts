import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Listar reviews de um produto
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const [reviews, total, stats] = await Promise.all([
      // Reviews paginadas
      prisma.review.findMany({
        where: {
          productId,
          active: true
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' }, // Reviews verificadas primeiro
          { helpful: 'desc' },  // Mais úteis primeiro
          { createdAt: 'desc' }  // Mais recentes primeiro
        ],
        skip,
        take: limit
      }),
      // Total de reviews
      prisma.review.count({
        where: {
          productId,
          active: true
        }
      }),
      // Estatísticas de rating
      prisma.review.groupBy({
        by: ['rating'],
        where: {
          productId,
          active: true
        },
        _count: {
          rating: true
        }
      })
    ])

    // Calcular estatísticas
    const totalReviews = total
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }

    stats.forEach(stat => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count.rating
    })

    return NextResponse.json({
      reviews: reviews.map(review => ({
        ...review,
        rating: Number(review.rating)
      })),
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      },
      statistics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// Criar nova review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, rating, title, comment } = await request.json()

    // Validações
    if (!productId || !rating) {
      return NextResponse.json({ error: 'Product ID and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Verificar se usuário já avaliou este produto
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Verificar se usuário comprou o produto (review verificada)
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: 'DELIVERED'
        }
      }
    })

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        verified: !!hasOrdered
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}