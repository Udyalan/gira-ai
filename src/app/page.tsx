import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Truck, CreditCard, Heart } from 'lucide-react'
import { generateHomeMetadata, injectJsonLd, SITE_CONFIG } from '@/lib/seo'

// SEO Metadata otimizada
export const metadata: Metadata = generateHomeMetadata()

// Schema.org para homepage
const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Malíbi Lingerie",
  "url": SITE_CONFIG.url,
  "logo": `${SITE_CONFIG.url}/logo.png`,
  "description": "Lingerie feminina premium com qualidade e elegância. Conjuntos sensuais, sutiãs confortáveis e bodies sofisticados.",
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "name": "Malíbi"
  },
  "areaServed": "BR",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catálogo Malíbi",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Conjuntos de Lingerie",
        "description": "Conjuntos sensuais e elegantes"
      },
      {
        "@type": "OfferCatalog", 
        "name": "Sutiãs Premium",
        "description": "Sutiãs confortáveis e sofisticados"
      },
      {
        "@type": "OfferCatalog",
        "name": "Calcinhas Delicadas", 
        "description": "Calcinhas femininas com qualidade premium"
      }
    ]
  }
}

const featuresSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Frete Grátis",
        "description": "Frete grátis para compras acima de R$ 150"
      }
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "item": {
        "@type": "Service",
        "name": "Pagamento Seguro",
        "description": "Transações 100% seguras via Stripe"
      }
    },
    {
      "@type": "ListItem",
      "position": 3, 
      "item": {
        "@type": "Service",
        "name": "Qualidade Premium",
        "description": "Tecidos nobres e acabamento refinado"
      }
    }
  ]
}

export default function HomePage() {
  return (
    <>
      {/* Injetar Schema.org */}
      {injectJsonLd(homepageSchema)}
      {injectJsonLd(featuresSchema)}

      <div className="min-h-screen">
        {/* Hero Section - Otimizada para SEO */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-malibi-rose-50 via-white to-malibi-rose-100">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="block">Lingerie Feminina</span>
              <span className="block text-malibi-rose-600">Premium & Sofisticada</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubra a coleção <strong>Malíbi</strong> de lingerie feminina premium. 
              Conjuntos sensuais, sutiãs confortáveis e bodies elegantes que realçam 
              sua <em>beleza natural</em> com qualidade e sofisticação.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/produtos"
                className="inline-flex items-center px-8 py-4 bg-malibi-rose-600 text-white text-lg font-semibold rounded-full hover:bg-malibi-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Ver catálogo completo de lingerie Malíbi"
              >
                Ver Coleção Completa
                <ArrowRight className="ml-2" size={20} />
              </Link>
              
              <Link
                href="/produtos?categoria=conjuntos"
                className="inline-flex items-center px-8 py-4 border-2 border-malibi-rose-600 text-malibi-rose-600 text-lg font-semibold rounded-full hover:bg-malibi-rose-600 hover:text-white transition-all duration-300"
                aria-label="Ver conjuntos de lingerie em destaque"
              >
                Conjuntos em Destaque
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" size={16} fill="currentColor" />
                <span><strong>4.8/5</strong> - 500+ Avaliações</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-green-600" size={16} />
                <span>Compra <strong>100% Segura</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="text-blue-600" size={16} />
                <span><strong>Frete Grátis</strong> acima de R$ 150</span>
              </div>
            </div>
          </div>

          {/* Background decorativo */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-malibi-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        </section>

        {/* Categorias - Com Rich Snippets */}
        <section className="py-20 bg-white" aria-labelledby="categorias-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 id="categorias-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explore Nossa Coleção Premium
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cada peça é cuidadosamente selecionada para oferecer <strong>conforto</strong>, 
                <strong>qualidade</strong> e <strong>elegância</strong> que você merece.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Conjuntos',
                  description: 'Conjuntos sensuais e elegantes para momentos especiais',
                  href: '/produtos?categoria=conjuntos',
                  image: '/images/categoria-conjuntos.jpg',
                  alt: 'Conjuntos de lingerie Malíbi - sensuais e elegantes'
                },
                {
                  name: 'Sutiãs',
                  description: 'Sutiãs confortáveis com design sofisticado e suporte perfeito',
                  href: '/produtos?categoria=sutias',
                  image: '/images/categoria-sutias.jpg',
                  alt: 'Sutiãs Malíbi - conforto e sofisticação'
                },
                {
                  name: 'Calcinhas',
                  description: 'Calcinhas delicadas com tecidos premium e acabamento impecável',
                  href: '/produtos?categoria=calcinhas',
                  image: '/images/categoria-calcinhas.jpg',
                  alt: 'Calcinhas Malíbi - delicadas e premium'
                },
                {
                  name: 'Bodies',
                  description: 'Bodies versáteis que combinam sensualidade e praticidade',
                  href: '/produtos?categoria=bodies',
                  image: '/images/categoria-bodies.jpg',
                  alt: 'Bodies Malíbi - versatilidade e sensualidade'
                }
              ].map((categoria, index) => (
                <article key={categoria.name} className="group cursor-pointer">
                  <Link href={categoria.href} aria-label={`Ver ${categoria.name} Malíbi`}>
                    <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={categoria.image}
                        alt={categoria.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-2">{categoria.name}</h3>
                        <p className="text-sm opacity-90">{categoria.description}</p>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Produtos em Destaque */}
        <section className="py-20 bg-gray-50" aria-labelledby="destaque-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 id="destaque-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Produtos Mais Desejados
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Peças exclusivas que conquistaram o coração de nossas clientes
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  name: 'Conjunto Sensual Premium',
                  price: 'R$ 189,90',
                  originalPrice: 'R$ 249,90',
                  image: '/images/produto-destaque-1.jpg',
                  href: '/produto/conjunto-sensual-premium',
                  badge: 'Mais Vendido'
                },
                {
                  name: 'Sutiã Push-Up Elegante',
                  price: 'R$ 89,90',
                  originalPrice: 'R$ 119,90',
                  image: '/images/produto-destaque-2.jpg', 
                  href: '/produto/sutia-push-up-elegante',
                  badge: 'Oferta'
                },
                {
                  name: 'Body Rendado Sofisticado',
                  price: 'R$ 139,90',
                  image: '/images/produto-destaque-3.jpg',
                  href: '/produto/body-rendado-sofisticado',
                  badge: 'Novidade'
                }
              ].map((produto) => (
                <article key={produto.name} className="group">
                  <Link href={produto.href}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={produto.image}
                          alt={produto.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <span className="absolute top-4 left-4 bg-malibi-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {produto.badge}
                        </span>
                        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Heart size={20} className="text-gray-600 hover:text-malibi-rose-600" />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{produto.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-malibi-rose-600">{produto.price}</span>
                          {produto.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">{produto.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/produtos"
                className="inline-flex items-center px-8 py-4 bg-malibi-rose-600 text-white font-semibold rounded-full hover:bg-malibi-rose-700 transition-colors duration-300"
              >
                Ver Todos os Produtos
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Benefícios - Trust Signals */}
        <section className="py-20 bg-white" aria-labelledby="beneficios-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 id="beneficios-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por Que Escolher a Malíbi?
              </h2>
              <p className="text-lg text-gray-600">
                Compromisso com a excelência em cada detalhe
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Truck className="w-12 h-12 text-malibi-rose-600" />,
                  title: 'Frete Grátis',
                  description: 'Frete grátis para todo Brasil em compras acima de R$ 150'
                },
                {
                  icon: <CreditCard className="w-12 h-12 text-malibi-rose-600" />,
                  title: 'Pagamento Seguro',
                  description: 'Transações 100% seguras com criptografia SSL'
                },
                {
                  icon: <Shield className="w-12 h-12 text-malibi-rose-600" />,
                  title: 'Qualidade Garantida',
                  description: 'Tecidos premium e acabamento artesanal'
                },
                {
                  icon: <Star className="w-12 h-12 text-malibi-rose-600" />,
                  title: 'Satisfação 100%',
                  description: '30 dias para troca e devolução sem complicações'
                }
              ].map((beneficio, index) => (
                <article key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-malibi-rose-50 rounded-full mb-6 group-hover:bg-malibi-rose-100 transition-colors duration-300">
                    {beneficio.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{beneficio.title}</h3>
                  <p className="text-gray-600">{beneficio.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-malibi-rose-600 to-malibi-rose-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronta Para Se Sentir Incrível?
            </h2>
            <p className="text-xl text-malibi-rose-100 mb-8">
              Descubra a lingerie que vai realçar sua beleza e confiança
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center px-8 py-4 bg-white text-malibi-rose-600 font-semibold rounded-full hover:bg-gray-50 transition-colors duration-300 shadow-lg"
            >
              Explorar Coleção Completa
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}