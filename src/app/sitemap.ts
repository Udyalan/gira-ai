import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_CONFIG } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    // Buscar produtos ativos
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        slug: true,
        updatedAt: true,
        featured: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // URLs dos produtos
    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_CONFIG.url}/produto/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: product.featured ? 0.8 : 0.6,
    }))

    // Buscar categorias
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // URLs das categorias
    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_CONFIG.url}/produtos?categoria=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticUrls, ...productUrls, ...categoryUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticUrls
  }
}