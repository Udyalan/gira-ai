import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Truck, Shield, HeartHandshake } from 'lucide-react'

// Mock data for demonstration
const featuredProducts = [
  {
    id: '1',
    name: 'Conjunto Elegance',
    price: 89.90,
    originalPrice: 119.90,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    category: 'Conjuntos'
  },
  {
    id: '2',
    name: 'Sutiã Comfort',
    price: 45.90,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    category: 'Sutiãs'
  },
  {
    id: '3',
    name: 'Body Sensual',
    price: 75.90,
    image: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=400&h=500&fit=crop',
    category: 'Bodies'
  },
  {
    id: '4',
    name: 'Calcinha Delicada',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=500&fit=crop',
    category: 'Calcinhas'
  }
]

const categories = [
  {
    name: 'Conjuntos',
    slug: 'conjuntos',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    description: 'Conjuntos completos para você se sentir especial'
  },
  {
    name: 'Sutiãs',
    slug: 'sutias',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
    description: 'Conforto e estilo para o dia a dia'
  },
  {
    name: 'Bodies',
    slug: 'bodies',
    image: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=300&h=400&fit=crop',
    description: 'Sensualidade e elegância em uma peça'
  },
  {
    name: 'Calcinhas',
    slug: 'calcinhas',
    image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=300&h=400&fit=crop',
    description: 'Modelos únicos para todos os momentos'
  }
]

const features = [
  {
    icon: Truck,
    title: 'Frete Grátis',
    description: 'Em compras acima de R$ 150'
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: 'Seus dados sempre protegidos'
  },
  {
    icon: HeartHandshake,
    title: 'Troca Garantida',
    description: 'Até 30 dias para trocar'
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-malibi-rose-50 to-malibi-gold-50">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Malíbi
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Desperte sua feminilidade com nossa coleção exclusiva de lingerie
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center px-8 py-4 bg-malibi-rose-500 text-white font-semibold rounded-full hover:bg-malibi-rose-600 transition-colors group"
          >
            Explorar Coleção
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop')] bg-cover bg-center"></div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra nossa seleção especial de peças que combinam conforto e elegância
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4] mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-malibi-rose-500 text-white px-2 py-1 rounded text-sm font-medium">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-malibi-rose-600 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-malibi-rose-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-malibi-gold-400 text-malibi-gold-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/produtos"
              className="inline-flex items-center px-6 py-3 border-2 border-malibi-rose-500 text-malibi-rose-500 font-semibold rounded-full hover:bg-malibi-rose-500 hover:text-white transition-colors"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-malibi-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Nossas Categorias
            </h2>
            <p className="text-xl text-gray-600">
              Encontre a peça perfeita para cada ocasião
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-malibi-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-malibi-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-malibi-rose-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Fique por dentro das novidades
          </h2>
          <p className="text-xl text-malibi-rose-100 mb-8">
            Receba ofertas exclusivas e seja a primeira a conhecer nossos lançamentos
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-l-full focus:outline-none focus:ring-2 focus:ring-malibi-rose-300"
              />
              <button className="px-6 py-3 bg-malibi-gold-500 text-white font-semibold rounded-r-full hover:bg-malibi-gold-600 transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}