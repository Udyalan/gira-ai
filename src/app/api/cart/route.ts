import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        variant: true
      }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId
        }
      }
    })

    let cartItem

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: {
            include: {
              category: true
            }
          },
          variant: true
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId,
          quantity
        },
        include: {
          product: {
            include: {
              category: true
            }
          },
          variant: true
        }
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}