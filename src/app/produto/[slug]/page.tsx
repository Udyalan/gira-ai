import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, Heart, Share2, Shield, Truck, RefreshCw } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema, generateFAQSchema, injectJsonLd } from '@/lib/seo'
import ProductGallery from '@/components/ProductGallery'
import AddToCartForm from '@/components/AddToCartForm'

interface Props {
  params: { slug: string }
}

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        slug,
        active: true 
      },
      include: {
        category: true,
        variants: {
          orderBy: { size: 'asc' }
        }
      }
    })

    if (!product) {
      return null
    }

    // Parse imageUrls
    let images: string[] = []
    try {
      images = JSON.parse(product.imageUrls)
    } catch {
      images = []
    }

    return {
      ...product,
      images
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return {
      title: 'Produto não encontrado | Malíbi Lingerie',
      description: 'O produto que você está procurando não foi encontrado.',
    }
  }

  return generateProductMetadata({
    ...product,
    images: product.images
  })
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  // Schemas para SEO
  const productSchema = generateProductSchema({
    ...product,
    images: product.images
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Produtos', url: '/produtos' },
    { name: product.category.name, url: `/produtos?categoria=${product.category.slug}` },
    { name: product.name }
  ])

  const faqData = [
    {
      question: 'Como escolher o tamanho correto?',
      answer: 'Consulte nossa tabela de medidas disponível na descrição do produto. Medimos busto, cintura e quadril para garantir o caimento perfeito.'
    },
    {
      question: 'Qual é o prazo de entrega?',
      answer: 'O prazo varia de 3 a 7 dias úteis para todo o Brasil. Compras acima de R$ 150 têm frete grátis.'
    },
    {
      question: 'Posso trocar se não servir?',
      answer: 'Sim! Você tem até 30 dias para solicitar a troca. A peça deve estar em perfeito estado, com etiquetas e na embalagem original.'
    },
    {
      question: 'Como cuidar da minha lingerie?',
      answer: 'Recomendamos lavagem à mão com água fria e sabão neutro. Não use alvejante e seque à sombra para preservar o tecido e a elasticidade.'
    }
  ]

  const faqSchema = generateFAQSchema(faqData)

  // Calcular preço mínimo
  const getLowestPrice = () => {
    const variantPrices = product.variants
      .filter(v => v.price)
      .map(v => v.price as number)
    
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices)
    }
    return Number(product.basePrice)
  }

  const lowestPrice = getLowestPrice()
  const hasVariantPrices = product.variants.some(v => v.price)

  return (
    <>
      {/* Injetar Schemas SEO */}
      {injectJsonLd(productSchema)}
      {injectJsonLd(breadcrumbSchema)}
      {injectJsonLd(faqSchema)}

      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <nav className="bg-gray-50 border-b" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-malibi-rose-600 transition-colors">
                  Início
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/produtos" className="text-gray-500 hover:text-malibi-rose-600 transition-colors">
                  Produtos
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link 
                  href={`/produtos?categoria=${product.category.slug}`}
                  className="text-gray-500 hover:text-malibi-rose-600 transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </li>
            </ol>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/produtos"
            className="inline-flex items-center text-malibi-rose-600 hover:text-malibi-rose-700 font-medium transition-colors mb-8"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar aos Produtos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div>
                <span className="inline-block px-3 py-1 bg-malibi-rose-100 text-malibi-rose-800 text-sm font-medium rounded-full">
                  {product.category.name}
                </span>
                {product.featured && (
                  <span className="ml-2 inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                    ⭐ Produto em Destaque
                  </span>
                )}
              </div>

              {/* Title */}
              <header>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">(127 avaliações)</span>
                  <span className="text-malibi-rose-600 font-medium">4.8/5</span>
                </div>
              </header>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-malibi-rose-600">
                    R$ {lowestPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {hasVariantPrices && product.variants.length > 1 && (
                    <span className="text-gray-500">a partir de</span>
                  )}
                </div>
                
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">✓ Em estoque</span>
                  <span className="text-gray-600">Frete grátis acima de R$ 150</span>
                </div>
              </div>

              {/* Add to Cart Form */}
              <AddToCartForm product={product} />

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart size={20} />
                  <span>Adicionar aos Favoritos</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                  <span>Compartilhar</span>
                </button>
              </div>

              {/* Trust Signals */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Benefícios da Malíbi</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Compra 100% segura e protegida</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Frete grátis acima de R$ 150</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-700">30 dias para troca e devolução</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Descrição do Produto</h2>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Características:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Tecido premium de alta qualidade</li>
                    <li>Acabamento artesanal refinado</li>
                    <li>Conforto durante todo o dia</li>
                    <li>Design exclusivo Malíbi</li>
                    <li>Disponível em múltiplos tamanhos</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Cuidados:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Lavar à mão com água fria</li>
                    <li>Usar sabão neutro</li>
                    <li>Não usar alvejante</li>
                    <li>Secar à sombra</li>
                    <li>Não torcer nem esfregar</li>
                  </ul>
                </div>
              </div>

              {/* Size Guide */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Guia de Tamanhos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tamanho</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Busto (cm)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cintura (cm)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Quadril (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">PP</td>
                        <td className="px-4 py-3 text-sm text-gray-600">80-84</td>
                        <td className="px-4 py-3 text-sm text-gray-600">60-64</td>
                        <td className="px-4 py-3 text-sm text-gray-600">86-90</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">P</td>
                        <td className="px-4 py-3 text-sm text-gray-600">84-88</td>
                        <td className="px-4 py-3 text-sm text-gray-600">64-68</td>
                        <td className="px-4 py-3 text-sm text-gray-600">90-94</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">M</td>
                        <td className="px-4 py-3 text-sm text-gray-600">88-92</td>
                        <td className="px-4 py-3 text-sm text-gray-600">68-72</td>
                        <td className="px-4 py-3 text-sm text-gray-600">94-98</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">G</td>
                        <td className="px-4 py-3 text-sm text-gray-600">92-96</td>
                        <td className="px-4 py-3 text-sm text-gray-600">72-76</td>
                        <td className="px-4 py-3 text-sm text-gray-600">98-102</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">GG</td>
                        <td className="px-4 py-3 text-sm text-gray-600">96-100</td>
                        <td className="px-4 py-3 text-sm text-gray-600">76-80</td>
                        <td className="px-4 py-3 text-sm text-gray-600">102-106</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h3>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <details key={index} className="border border-gray-200 rounded-lg">
                    <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:bg-gray-50">
                      {faq.question}
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}