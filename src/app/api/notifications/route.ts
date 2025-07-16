import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Listar notificações do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const skip = (page - 1) * limit

    const whereClause = {
      userId: session.user.id,
      ...(unreadOnly && { read: false })
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false
        }
      })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// Criar notificação (Admin ou sistema)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, userIds, type, title, message, data } = await request.json()

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Type, title and message are required' }, { status: 400 })
    }

    // Se userIds for fornecido, criar notificação para múltiplos usuários
    if (userIds && Array.isArray(userIds)) {
      const notifications = await prisma.notification.createMany({
        data: userIds.map(uid => ({
          userId: uid,
          type,
          title,
          message,
          data: data ? JSON.stringify(data) : null
        }))
      })

      return NextResponse.json({ created: notifications.count }, { status: 201 })
    }

    // Criar notificação para um usuário específico
    if (userId) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: data ? JSON.stringify(data) : null
        }
      })

      return NextResponse.json(notification, { status: 201 })
    }

    return NextResponse.json({ error: 'userId or userIds is required' }, { status: 400 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// Marcar todas como lidas
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}