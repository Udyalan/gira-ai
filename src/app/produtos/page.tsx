'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Grid, List, ArrowUpDown, Heart, Star } from 'lucide-react'
import { generateBreadcrumbSchema, injectJsonLd } from '@/lib/seo'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  imageUrls: string
  featured: boolean
  category: {
    id: string
    name: string
  }
  variants: Array<{
    id: string
    size: string
    color: string
    price: number | null
    stock: number
  }>
}

interface Category {
  id: string
  name: string
  slug: string
}

const sortOptions = [
  { value: 'name', label: 'Nome A-Z' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'featured', label: 'Destaques' }
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filters from URL
  const currentCategory = searchParams.get('categoria') || ''
  const currentSearch = searchParams.get('busca') || ''
  const currentSort = searchParams.get('ordem') || 'name'
  
  // Local filters
  const [searchTerm, setSearchTerm] = useState(currentSearch)
  const [selectedCategory, setSelectedCategory] = useState(currentCategory)
  const [sortBy, setSortBy] = useState(currentSort)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [showFilters, setShowFilters] = useState(false)

  // Breadcrumb Schema
  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    { name: 'Produtos' }
  ]

  if (selectedCategory) {
    const category = categories.find(c => c.slug === selectedCategory)
    if (category) {
      breadcrumbItems.push({ name: category.name })
    }
  }

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    if (selectedCategory) params.set('categoria', selectedCategory)
    if (searchTerm) params.set('busca', searchTerm)
    if (sortBy !== 'name') params.set('ordem', sortBy)
    
    const newUrl = `/produtos${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState(null, '', newUrl)
  }, [selectedCategory, searchTerm, sortBy])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoria', selectedCategory)
      if (searchTerm) params.append('busca', searchTerm)
      if (sortBy) params.append('ordem', sortBy)

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getProductImages = (imageUrls: string) => {
    try {
      return JSON.parse(imageUrls)
    } catch {
      return []
    }
  }

  const getLowestPrice = (product: Product) => {
    const variantPrices = product.variants
      .filter(v => v.price)
      .map(v => v.price as number)
    
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices)
    }
    return Number(product.basePrice)
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSortBy('name')
    setPriceRange({ min: 0, max: 1000 })
  }

  const currentCategoryName = categories.find(c => c.slug === selectedCategory)?.name

  // JSON-LD para produtos
  const productsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": getProductImages(product.imageUrls),
        "url": `/produto/${product.slug}`,
        "offers": {
          "@type": "Offer",
          "price": getLowestPrice(product),
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  }

  return (
    <>
      {/* SEO Schema */}
      {injectJsonLd(breadcrumbSchema)}
      {injectJsonLd(productsSchema)}

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-malibi-rose-600 transition-colors">
                  Início
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-gray-900 font-medium">Produtos</span>
              </li>
              {currentCategoryName && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <span className="text-malibi-rose-600 font-medium">{currentCategoryName}</span>
                  </li>
                </>
              )}
            </ol>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentCategoryName 
                ? `${currentCategoryName} Malíbi - Lingerie Premium` 
                : 'Catálogo Completo - Lingerie Feminina Malíbi'
              }
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              {currentCategoryName
                ? `Descubra nossa coleção exclusiva de ${currentCategoryName.toLowerCase()} com qualidade premium e design sofisticado.`
                : 'Explore nossa coleção completa de lingerie feminina premium. Conjuntos sensuais, sutiãs confortáveis, calcinhas delicadas e bodies elegantes.'
              }
            </p>
          </header>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 focus:border-transparent"
                    aria-label="Buscar produtos de lingerie"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-4 items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
                  aria-label="Filtrar por categoria"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
                  aria-label="Ordenar produtos"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-malibi-rose-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    aria-label="Visualização em grade"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-malibi-rose-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    aria-label="Visualização em lista"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || searchTerm) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtros ativos:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-malibi-rose-100 text-malibi-rose-800">
                    {currentCategoryName}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 hover:text-malibi-rose-600"
                      aria-label={`Remover filtro ${currentCategoryName}`}
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-malibi-rose-100 text-malibi-rose-800">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-malibi-rose-600"
                      aria-label="Remover busca"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-malibi-rose-600 hover:text-malibi-rose-700 font-medium"
                >
                  Limpar todos
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {loading ? 'Carregando...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou fazer uma nova busca
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-6 py-3 bg-malibi-rose-600 text-white font-semibold rounded-lg hover:bg-malibi-rose-700 transition-colors"
                >
                  Ver todos os produtos
                </button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => {
                const images = getProductImages(product.imageUrls)
                const lowestPrice = getLowestPrice(product)
                
                return (
                  <article 
                    key={product.id} 
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <Link href={`/produto/${product.slug}`} className={viewMode === 'list' ? 'flex w-full' : 'block'}>
                      <div className={`relative overflow-hidden bg-gray-100 ${
                        viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'
                      }`}>
                        {images.length > 0 && (
                          <Image
                            src={images[0]}
                            alt={`${product.name} - Lingerie Malíbi`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={viewMode === 'grid' 
                              ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              : "192px"
                            }
                          />
                        )}
                        
                        {product.featured && (
                          <span className="absolute top-3 left-3 bg-malibi-rose-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Destaque
                          </span>
                        )}
                        
                        <button 
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          aria-label={`Adicionar ${product.name} aos favoritos`}
                        >
                          <Heart size={16} className="text-gray-600 hover:text-malibi-rose-600" />
                        </button>
                      </div>
                      
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                        <div>
                          <p className="text-xs text-malibi-rose-600 font-medium uppercase tracking-wide mb-1">
                            {product.category.name}
                          </p>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-malibi-rose-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          {viewMode === 'list' && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-malibi-rose-600">
                                R$ {lowestPrice.toFixed(2).replace('.', ',')}
                              </span>
                              <p className="text-xs text-gray-500">
                                {product.variants.length > 1 && 'a partir de'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">4.8</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>{product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}</span>
                            <span>Em estoque</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}