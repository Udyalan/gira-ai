import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Remover produto da wishlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o item existe e pertence ao usuário
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        product: true
      }
    })

    if (!wishlistItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }

    await prisma.wishlist.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: `${wishlistItem.product.name} removido dos favoritos` 
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}

// Remover por produto ID
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productId = params.id

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      },
      include: {
        product: true
      }
    })

    if (!wishlistItem) {
      return NextResponse.json({ error: 'Product not in wishlist' }, { status: 404 })
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `${wishlistItem.product.name} removido dos favoritos` 
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}