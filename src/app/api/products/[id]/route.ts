import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, basePrice, categoryId, imageUrls, featured, active, variants } = body

    // Update slug if name changed
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        basePrice,
        categoryId,
        imageUrls: JSON.stringify(imageUrls || []),
        featured: featured || false,
        active: active !== undefined ? active : true
      }
    })

    // Handle variants update
    if (variants && Array.isArray(variants)) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: params.id }
      })

      // Create new variants
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((variant: any) => ({
            ...variant,
            productId: params.id
          }))
        })
      }
    }

    // Fetch updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete - just mark as inactive
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}