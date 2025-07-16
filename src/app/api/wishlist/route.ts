import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Obter wishlist do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
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
      orderBy: { createdAt: 'desc' }
    })

    // Calcular rating médio para cada produto
    const wishlistWithRatings = wishlistItems.map(item => {
      const reviews = item.product.reviews
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

      return {
        id: item.id,
        productId: item.productId,
        addedAt: item.createdAt,
        product: {
          ...item.product,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length
        }
      }
    })

    return NextResponse.json(wishlistWithRatings)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

// Adicionar produto à wishlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId, active: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Verificar se já está na wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'GENERAL',
        title: 'Produto adicionado aos favoritos',
        message: `${product.name} foi adicionado à sua lista de desejos`
      }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}