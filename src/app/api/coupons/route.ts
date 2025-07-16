import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Listar cupons (Admin) ou validar cupom (Cliente)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // Se código foi fornecido, validar cupom
    if (code) {
      return await validateCoupon(code, session.user.id)
    }

    // Listar cupons (apenas admin)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
            userUsages: true
          }
        }
      }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

// Criar cupom (Admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      code,
      name,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      userUsageLimit,
      startsAt,
      expiresAt,
      active = true
    } = body

    // Validações
    if (!code || !name || !type || !value || !startsAt || !expiresAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (new Date(startsAt) >= new Date(expiresAt)) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 })
    }

    // Verificar se código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit,
        userUsageLimit,
        startsAt: new Date(startsAt),
        expiresAt: new Date(expiresAt),
        active
      }
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

// Validar cupom
async function validateCoupon(code: string, userId: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { 
        code: code.toUpperCase(),
        active: true
      },
      include: {
        userUsages: {
          where: { userId }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom não encontrado ou inativo' 
      }, { status: 404 })
    }

    const now = new Date()

    // Verificar se cupom está dentro do período válido
    if (now < coupon.startsAt || now > coupon.expiresAt) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom expirado ou ainda não ativo' 
      }, { status: 400 })
    }

    // Verificar limite de uso total
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom esgotado' 
      }, { status: 400 })
    }

    // Verificar limite de uso por usuário
    if (coupon.userUsageLimit && coupon.userUsages.length >= coupon.userUsageLimit) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Você já utilizou este cupom o máximo de vezes permitido' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null
      }
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Erro ao validar cupom' 
    }, { status: 500 })
  }
}