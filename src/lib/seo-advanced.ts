import { Product, Review } from '@prisma/client'

// Rich Snippets para E-commerce
export const generateProductRichSnippet = (product: any) => {
  const images = JSON.parse(product.imageUrls || '[]')
  const reviews = product.reviews || []
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/produto/${product.slug}`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Malíbi'
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: Number(product.basePrice),
      priceCurrency: 'BRL',
      availability: product.variants?.some((v: any) => v.stock > 0) 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/produto/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Malíbi Lingerie'
      },
      validFrom: new Date().toISOString(),
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'BRL'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY'
          }
        }
      }
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1
      },
      review: reviews.slice(0, 5).map((review: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        author: {
          '@type': 'Person',
          name: review.user?.name || 'Cliente Malíbi'
        },
        reviewBody: review.comment || review.title,
        datePublished: review.createdAt,
        ...(review.verified && {
          additionalType: 'https://schema.org/VerifiedReview'
        })
      }))
    })
  }
}

// FAQ Schema para produtos
export const generateProductFAQSchema = (product: any) => {
  const faqs = [
    {
      question: `Como escolher o tamanho ideal para ${product.name}?`,
      answer: 'Consulte nosso guia de tamanhos interativo. Medindo busto, cintura e quadril, nossa calculadora recomenda o tamanho perfeito. Entre dois tamanhos, escolha o maior para mais conforto.'
    },
    {
      question: 'Qual o prazo de entrega?',
      answer: 'Entregamos em todo o Brasil: Região Sudeste/Sul (3-5 dias úteis), demais regiões (5-8 dias úteis). Frete grátis para compras acima de R$ 150.'
    },
    {
      question: 'Posso trocar se não servir?',
      answer: 'Sim! Você tem 30 dias para trocas. O produto deve estar sem uso, com etiquetas e na embalagem original. Primeira troca grátis.'
    },
    {
      question: 'Como cuidar da lingerie?',
      answer: 'Lave à mão com água fria e sabão neutro. Não torça, seque à sombra. Para durabilidade máxima, use saquinho de proteção na máquina em ciclo delicado.'
    }
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Breadcrumb Schema
export const generateBreadcrumbSchema = (items: Array<{name: string, url?: string}>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url })
    }))
  }
}

// SearchAction Schema
export const generateSearchActionSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/busca?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

// Local Business Schema (para SEO local)
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Malíbi Lingerie',
    description: 'Loja especializada em lingerie feminina premium, conjuntos sensuais e moda íntima sofisticada.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    image: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressRegion: 'São Paulo',
      addressLocality: 'São Paulo'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-23.5505',
      longitude: '-46.6333'
    },
    openingHours: [
      'Mo-Fr 09:00-18:00',
      'Sa 09:00-14:00'
    ],
    telephone: '+55-11-99999-9999',
    email: 'contato@malibi.com.br',
    priceRange: '$$',
    paymentAccepted: ['Credit Card', 'Debit Card', 'PIX', 'Boleto'],
    currenciesAccepted: 'BRL',
    areaServed: {
      '@type': 'Country',
      name: 'Brasil'
    },
    serviceType: 'Online Store',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo Malíbi',
      itemListElement: [
        {
          '@type': 'OfferCategory',
          name: 'Conjuntos de Lingerie'
        },
        {
          '@type': 'OfferCategory', 
          name: 'Sutiãs'
        },
        {
          '@type': 'OfferCategory',
          name: 'Calcinhas'
        },
        {
          '@type': 'OfferCategory',
          name: 'Bodies'
        }
      ]
    }
  }
}

// Collection/Category Page Schema
export const generateCollectionPageSchema = (category: any, products: any[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - Malíbi Lingerie`,
    description: `Coleção completa de ${category.name.toLowerCase()} premium. Qualidade superior, design exclusivo e conforto incomparável.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/produtos?category=${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: category.name,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: JSON.parse(product.imageUrls || '[]')[0],
          url: `${process.env.NEXT_PUBLIC_APP_URL}/produto/${product.slug}`,
          offers: {
            '@type': 'Offer',
            price: Number(product.basePrice),
            priceCurrency: 'BRL'
          }
        }
      }))
    }
  }
}

// Offer Schema para promoções
export const generateOfferSchema = (product: any, discount?: number) => {
  const originalPrice = Number(product.basePrice)
  const discountedPrice = discount ? originalPrice * (1 - discount / 100) : originalPrice
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: product.name,
      image: JSON.parse(product.imageUrls || '[]')
    },
    price: discountedPrice,
    priceCurrency: 'BRL',
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    availability: 'https://schema.org/InStock',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/produto/${product.slug}`,
    seller: {
      '@type': 'Organization',
      name: 'Malíbi Lingerie'
    },
    ...(discount && discount > 0 && {
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30
      }
    })
  }
}

// Video Schema para conteúdo
export const generateVideoSchema = (videoData: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoData.name,
    description: videoData.description,
    thumbnailUrl: videoData.thumbnailUrl,
    uploadDate: videoData.uploadDate,
    contentUrl: videoData.contentUrl,
    embedUrl: videoData.embedUrl,
    duration: videoData.duration,
    publisher: {
      '@type': 'Organization',
      name: 'Malíbi Lingerie',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
      }
    }
  }
}

// Social Media Posting Schema
export const generateSocialMediaPostSchema = (post: {
  headline: string
  articleBody: string
  image: string
  datePublished: string
  author?: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: post.headline,
    articleBody: post.articleBody,
    image: post.image,
    datePublished: post.datePublished,
    author: {
      '@type': 'Organization',
      name: post.author || 'Malíbi Lingerie'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Malíbi Lingerie',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': process.env.NEXT_PUBLIC_APP_URL
    }
  }
}