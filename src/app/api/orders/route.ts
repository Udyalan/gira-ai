import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let whereClause: any = {}

    // If not admin, only show user's own orders
    if (session.user.role !== 'ADMIN') {
      whereClause.userId = session.user.id
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrls: true
                }
              },
              variant: {
                select: {
                  size: true,
                  color: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      paymentMethod
    } = body

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        variant: true
      }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate total
    let totalAmount = 0
    for (const item of cartItems) {
      const price = item.variant?.price || Number(item.product.basePrice)
      totalAmount += price * item.quantity
    }

    // Generate order number
    const orderNumber = `MLD${Date.now()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        paymentMethod,
        totalAmount,
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price || Number(item.product.basePrice)
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })

    // Clear cart after successful order
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    // Update stock
    for (const item of cartItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}