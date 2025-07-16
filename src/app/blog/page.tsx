'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Clock, Tag, ArrowRight, Search, Filter } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: {
    name: string
    image: string
    bio: string
  }
  category: {
    name: string
    slug: string
    color: string
  }
  tags: string[]
  publishedAt: string
  readTime: number
  views: number
  featured: boolean
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Mock data - Integrar com API/CMS real
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Como Escolher o Sutiã Perfeito: Guia Completo de Tamanhos e Modelos',
      slug: 'como-escolher-sutia-perfeito-guia-completo',
      excerpt: 'Descubra os segredos para encontrar o sutiã ideal para seu corpo. Dicas de especialistas, medidas corretas e modelos para cada ocasião.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      author: {
        name: 'Fernanda Silva',
        image: '/team/fernanda.jpg',
        bio: 'Especialista em moda íntima há 15 anos'
      },
      category: {
        name: 'Guias',
        slug: 'guias',
        color: 'bg-blue-100 text-blue-700'
      },
      tags: ['sutiã', 'tamanhos', 'guia', 'dicas'],
      publishedAt: '2024-01-15',
      readTime: 8,
      views: 2847,
      featured: true,
      seo: {
        metaTitle: 'Como Escolher o Sutiã Perfeito: Guia Completo 2024',
        metaDescription: 'Guia completo para escolher o sutiã ideal. Aprenda sobre tamanhos, modelos e dicas de especialistas. Conforto e elegância garantidos.',
        keywords: ['sutiã perfeito', 'como escolher sutiã', 'tamanho de sutiã', 'tipos de sutiã', 'lingerie']
      }
    },
    {
      id: '2',
      title: 'Tendências de Lingerie 2024: Cores, Texturas e Estilos em Alta',
      slug: 'tendencias-lingerie-2024-cores-texturas-estilos',
      excerpt: 'Fique por dentro das principais tendências de lingerie para 2024. Desde cores vibrantes até texturas inovadoras.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=800',
      author: {
        name: 'Mariana Costa',
        image: '/team/mariana.jpg',
        bio: 'Fashion stylist e consultora de moda'
      },
      category: {
        name: 'Tendências',
        slug: 'tendencias',
        color: 'bg-pink-100 text-pink-700'
      },
      tags: ['tendências', '2024', 'moda', 'cores'],
      publishedAt: '2024-01-10',
      readTime: 6,
      views: 1923,
      featured: true,
      seo: {
        metaTitle: 'Tendências de Lingerie 2024: O Que Está em Alta',
        metaDescription: 'Descubra as principais tendências de lingerie para 2024. Cores, texturas, estilos e muito mais para você ficar na moda.',
        keywords: ['tendências lingerie 2024', 'moda íntima', 'cores lingerie', 'estilos lingerie']
      }
    },
    {
      id: '3',
      title: 'Cuidados com a Lingerie: Como Lavar e Conservar suas Peças Favoritas',
      slug: 'cuidados-lingerie-como-lavar-conservar',
      excerpt: 'Aprenda as melhores técnicas para cuidar da sua lingerie e fazer suas peças durarem muito mais tempo.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1582142306909-195724d2f7e4?w=800',
      author: {
        name: 'Ana Rodrigues',
        image: '/team/ana.jpg',
        bio: 'Especialista em cuidados têxteis'
      },
      category: {
        name: 'Cuidados',
        slug: 'cuidados',
        color: 'bg-green-100 text-green-700'
      },
      tags: ['cuidados', 'lavagem', 'conservação', 'dicas'],
      publishedAt: '2024-01-08',
      readTime: 5,
      views: 1456,
      featured: false,
      seo: {
        metaTitle: 'Como Cuidar da Lingerie: Guia de Lavagem e Conservação',
        metaDescription: 'Aprenda como lavar e conservar sua lingerie corretamente. Dicas essenciais para fazer suas peças durarem mais.',
        keywords: ['cuidar lingerie', 'como lavar lingerie', 'conservar lingerie', 'dicas lavagem']
      }
    }
  ]

  const mockCategories = [
    { name: 'Guias', slug: 'guias', count: 8, color: 'bg-blue-100 text-blue-700' },
    { name: 'Tendências', slug: 'tendencias', count: 12, color: 'bg-pink-100 text-pink-700' },
    { name: 'Cuidados', slug: 'cuidados', count: 6, color: 'bg-green-100 text-green-700' },
    { name: 'Estilo de Vida', slug: 'estilo-vida', count: 10, color: 'bg-purple-100 text-purple-700' }
  ]

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setPosts(mockPosts)
      setCategories(mockCategories)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category.slug === selectedCategory
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Blog Malíbi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Dicas, tendências e guias sobre lingerie, moda íntima e estilo de vida.
              Tudo que você precisa saber para se sentir ainda mais confiante.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar artigos..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Artigos em Destaque</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.map(post => (
                    <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative h-64">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${post.category.color}`}>
                            {post.category.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="block mb-3 hover:text-pink-600 transition-colors"
                        >
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {post.readTime} min
                            </div>
                          </div>
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-medium"
                          >
                            Ler mais <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Posts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Todos os Artigos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map(post => (
                  <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative h-48">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${post.category.color}`}>
                          {post.category.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="block mb-2 hover:text-pink-600 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </div>
                        <span>{post.views.toLocaleString()} visualizações</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categorias</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-pink-50 text-pink-700' : 'hover:bg-gray-50'
                  }`}
                >
                  Todas as categorias
                </button>
                {categories.map(category => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug ? 'bg-pink-50 text-pink-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Newsletter Malíbi</h3>
              <p className="text-pink-100 text-sm mb-4">
                Receba dicas exclusivas, tendências e novidades direto no seu email.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-pink-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Quero receber!
                </button>
              </form>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tags Populares</h3>
              <div className="flex flex-wrap gap-2">
                {['lingerie', 'sutiã', 'tendências', 'cuidados', 'guia', 'dicas', 'moda', 'conforto'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-pink-100 hover:text-pink-700 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}