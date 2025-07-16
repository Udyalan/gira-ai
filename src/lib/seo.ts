import { Metadata } from 'next'

// Dados base da empresa
export const SITE_CONFIG = {
  name: 'Malíbi',
  title: 'Malíbi - Lingerie Feminina Sofisticada | Conjuntos, Sutiãs e Bodies',
  description: 'Lingerie feminina de qualidade premium. Conjuntos sensuais, sutiãs confortáveis, calcinhas delicadas e bodies elegantes. Entrega rápida e frete grátis acima de R$ 150.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://malibi.com.br',
  siteName: 'Malíbi Lingerie',
  locale: 'pt_BR',
  type: 'website',
  keywords: [
    'lingerie feminina',
    'conjuntos de lingerie',
    'sutiãs',
    'calcinhas',
    'bodies',
    'lingerie sexy',
    'moda íntima',
    'lingerie premium',
    'conjuntos sensuais',
    'roupa íntima feminina',
    'lingerie brasileira',
    'malíbi lingerie'
  ],
  author: 'Malíbi Lingerie',
  creator: 'Malíbi',
  publisher: 'Malíbi Lingerie',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

// Schema.org para e-commerce
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  description: SITE_CONFIG.description,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+55-11-99999-9999',
    contactType: 'customer service',
    areaServed: 'BR',
    availableLanguage: 'Portuguese'
  },
  sameAs: [
    'https://www.facebook.com/malibilingerie',
    'https://www.instagram.com/malibilingerie',
    'https://www.tiktok.com/@malibilingerie'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua das Flores, 123',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    postalCode: '01234-567',
    addressCountry: 'BR'
  }
})

// Schema para produto
export const generateProductSchema = (product: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images || [],
  brand: {
    '@type': 'Brand',
    name: 'Malíbi'
  },
  offers: {
    '@type': 'Offer',
    price: product.basePrice,
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: 'Malíbi Lingerie'
    }
  },
  category: product.category?.name,
  sku: product.id,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127'
  }
})

// Metadata para página inicial
export const generateHomeMetadata = (): Metadata => ({
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords.join(', '),
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  formatDetection: SITE_CONFIG.formatDetection,
  robots: SITE_CONFIG.robots,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.siteName,
    title: 'Malíbi - Lingerie Feminina Premium | Conjuntos Sensuais e Elegantes',
    description: 'Descubra a coleção Malíbi de lingerie feminina premium. Conjuntos sensuais, sutiãs push-up, calcinhas delicadas e bodies que realçam sua beleza natural.',
    images: [
      {
        url: `${SITE_CONFIG.url}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: 'Malíbi Lingerie - Coleção Premium',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@malibilingerie',
    creator: '@malibilingerie',
    title: 'Malíbi - Lingerie Feminina Premium',
    description: 'Lingerie sofisticada que realça sua beleza. Conjuntos, sutiãs, calcinhas e bodies de qualidade premium.',
    images: [`${SITE_CONFIG.url}/twitter-home.jpg`],
  },
  verification: SITE_CONFIG.verification,
})

// Metadata para produtos
export const generateProductMetadata = (product: any): Metadata => ({
  title: `${product.name} | Malíbi Lingerie - ${product.category?.name}`,
  description: `${product.description} Compre ${product.name} na Malíbi. Lingerie feminina premium com qualidade e estilo. Frete grátis acima de R$ 150.`,
  keywords: [
    product.name.toLowerCase(),
    product.category?.name.toLowerCase(),
    'lingerie feminina',
    'malíbi',
    ...SITE_CONFIG.keywords
  ].join(', '),
  alternates: {
    canonical: `${SITE_CONFIG.url}/produto/${product.slug}`,
  },
  openGraph: {
    type: 'product',
    locale: SITE_CONFIG.locale,
    url: `${SITE_CONFIG.url}/produto/${product.slug}`,
    siteName: SITE_CONFIG.siteName,
    title: `${product.name} | Malíbi Lingerie`,
    description: `${product.description} Compre agora na Malíbi com frete grátis.`,
    images: product.images?.map((image: string, index: number) => ({
      url: image,
      width: 800,
      height: 800,
      alt: `${product.name} - Imagem ${index + 1}`,
    })) || [],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@malibilingerie',
    title: `${product.name} | Malíbi`,
    description: product.description,
    images: product.images?.[0] ? [product.images[0]] : [],
  },
})

// Metadata para categorias
export const generateCategoryMetadata = (
  category: string,
  description: string,
  totalProducts: number
): Metadata => ({
  title: `${category} | Malíbi Lingerie - ${totalProducts} Produtos`,
  description: `${description} Confira nossa coleção de ${category.toLowerCase()} com ${totalProducts} produtos. Qualidade premium, conforto e elegância.`,
  keywords: [
    category.toLowerCase(),
    `${category.toLowerCase()} feminina`,
    'lingerie',
    'malíbi',
    ...SITE_CONFIG.keywords
  ].join(', '),
  alternates: {
    canonical: `${SITE_CONFIG.url}/produtos?categoria=${category.toLowerCase()}`,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: `${SITE_CONFIG.url}/produtos?categoria=${category.toLowerCase()}`,
    siteName: SITE_CONFIG.siteName,
    title: `${category} Premium | Malíbi Lingerie`,
    description: `${description} Descubra ${totalProducts} produtos únicos.`,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-${category.toLowerCase()}.jpg`,
        width: 1200,
        height: 630,
        alt: `${category} Malíbi Lingerie`,
      }
    ],
  },
})

// Função para gerar breadcrumbs estruturados
export const generateBreadcrumbSchema = (items: Array<{name: string, url?: string}>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url ? `${SITE_CONFIG.url}${item.url}` : undefined
  }))
})

// FAQ Schema para páginas de produto
export const generateFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
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
})

// Função para injetar schema no head
export const injectJsonLd = (schema: object) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
)

// URLs canônicas
export const getCanonicalUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_CONFIG.url}${cleanPath}`
}