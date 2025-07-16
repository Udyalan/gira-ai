import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic stats
    const [totalOrders, totalProducts, totalCustomers] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ])

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        paymentStatus: 'paid'
      }
    })

    const totalRevenue = Number(revenueResult._sum.totalAmount) || 0

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    })

    // Get top products
    const topProductsQuery = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      take: 5,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      }
    })

    // Get product details for top products
    const topProducts = await Promise.all(
      topProductsQuery.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true }
        })
        
        return {
          id: item.productId,
          name: product?.name || 'Produto não encontrado',
          totalSold: item._sum.quantity || 0,
          revenue: Number(item._sum.price) || 0
        }
      })
    )

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders: recentOrders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount)
      })),
      topProducts
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}