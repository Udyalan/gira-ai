'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  Star, 
  Heart, 
  ShoppingCart,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  minPrice: number
  imageUrls: string
  featured: boolean
  category: {
    name: string
    slug: string
  }
  hasStock: boolean
  averageRating: number
  reviewCount: number
  availableSizes: string[]
  availableColors: string[]
  variantCount: number
}

interface Filters {
  categories: Array<{ id: string; name: string; slug: string; count: number }>
  sizes: Array<{ value: string; count: number }>
  colors: Array<{ value: string; count: number }>
  priceRange: { min: number; max: number }
}

export default function BuscaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true'
  })
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Price range
  const [priceRange, setPriceRange] = useState({
    min: activeFilters.minPrice ? Number(activeFilters.minPrice) : 0,
    max: activeFilters.maxPrice ? Number(activeFilters.maxPrice) : 1000
  })

  useEffect(() => {
    performSearch()
  }, [searchParams, page])

  const performSearch = async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      if (query) params.append('q', query)
      if (activeFilters.category) params.append('category', activeFilters.category)
      if (activeFilters.minPrice) params.append('minPrice', activeFilters.minPrice)
      if (activeFilters.maxPrice) params.append('maxPrice', activeFilters.maxPrice)
      if (activeFilters.size) params.append('size', activeFilters.size)
      if (activeFilters.color) params.append('color', activeFilters.color)
      if (activeFilters.inStock) params.append('inStock', 'true')
      if (activeFilters.featured) params.append('featured', 'true')
      if (sortBy !== 'relevance') params.append('sortBy', sortBy)
      
      params.append('page', page.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/search?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (page === 1) {
          setProducts(data.products)
        } else {
          setProducts(prev => [...prev, ...data.products])
        }
        
        setFilters(data.filters)
        setTotalResults(data.pagination.total)
        setHasMore(data.pagination.page < data.pagination.pages)
      }
    } catch (error) {
      console.error('Error performing search:', error)
      toast.error('Erro ao buscar produtos')
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<typeof activeFilters>) => {
    const updatedFilters = { ...activeFilters, ...newFilters }
    setActiveFilters(updatedFilters)
    
    // Update URL
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (updatedFilters.category) params.append('category', updatedFilters.category)
    if (updatedFilters.minPrice) params.append('minPrice', updatedFilters.minPrice)
    if (updatedFilters.maxPrice) params.append('maxPrice', updatedFilters.maxPrice)
    if (updatedFilters.size) params.append('size', updatedFilters.size)
    if (updatedFilters.color) params.append('color', updatedFilters.color)
    if (updatedFilters.inStock) params.append('inStock', 'true')
    if (updatedFilters.featured) params.append('featured', 'true')
    if (sortBy !== 'relevance') params.append('sortBy', sortBy)
    
    router.push(`/busca?${params}`)
    setPage(1)
  }

  const clearFilters = () => {
    setActiveFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      inStock: false,
      featured: false
    })
    setPriceRange({ min: 0, max: 1000 })
    router.push(`/busca${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  const handlePriceChange = () => {
    updateFilters({
      minPrice: priceRange.min > 0 ? priceRange.min.toString() : '',
      maxPrice: priceRange.max < 1000 ? priceRange.max.toString() : ''
    })
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      {filters?.categories && filters.categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
          <div className="space-y-2">
            {filters.categories.map(category => (
              <button
                key={category.id}
                onClick={() => updateFilters({ 
                  category: activeFilters.category === category.slug ? '' : category.slug 
                })}
                className={`flex items-center justify-between w-full p-2 rounded text-left transition-colors ${
                  activeFilters.category === category.slug 
                    ? 'bg-pink-50 text-pink-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Faixa de Preço</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min || ''}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max || ''}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handlePriceChange}
            className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors text-sm"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Sizes */}
      {filters?.sizes && filters.sizes.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tamanhos</h3>
          <div className="grid grid-cols-3 gap-2">
            {filters.sizes.map(size => (
              <button
                key={size.value}
                onClick={() => updateFilters({ 
                  size: activeFilters.size === size.value ? '' : size.value 
                })}
                className={`p-2 border rounded text-sm transition-colors ${
                  activeFilters.size === size.value 
                    ? 'border-pink-500 bg-pink-50 text-pink-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {filters?.colors && filters.colors.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Cores</h3>
          <div className="space-y-2">
            {filters.colors.map(color => (
              <button
                key={color.value}
                onClick={() => updateFilters({ 
                  color: activeFilters.color === color.value ? '' : color.value 
                })}
                className={`flex items-center justify-between w-full p-2 rounded text-left transition-colors ${
                  activeFilters.color === color.value 
                    ? 'bg-pink-50 text-pink-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{color.value}</span>
                <span className="text-xs text-gray-500">({color.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Filters */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Filtros</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeFilters.inStock}
              onChange={(e) => updateFilters({ inStock: e.target.checked })}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm">Apenas em estoque</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeFilters.featured}
              onChange={(e) => updateFilters({ featured: e.target.checked })}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm">Produtos em destaque</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
      >
        Limpar Filtros
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {query ? `Resultados para "${query}"` : 'Buscar Produtos'}
          </h1>
          
          {totalResults > 0 && (
            <p className="text-gray-600">
              {totalResults} {totalResults === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && router.push(`/busca?q=${encodeURIComponent(query)}`)}
              placeholder="Buscar produtos..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    updateFilters({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="relevance">Mais relevantes</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="name_asc">Nome A-Z</option>
                  <option value="name_desc">Nome Z-A</option>
                  <option value="featured">Em destaque</option>
                  <option value="popular">Mais vendidos</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                  {products.map((product) => {
                    const images = JSON.parse(product.imageUrls)
                    
                    return (
                      <div key={product.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                        {/* Product Image */}
                        <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'}`}>
                          <Link href={`/produto/${product.slug}`}>
                            <Image
                              src={images[0]}
                              alt={product.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.featured && (
                              <span className="bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded">
                                Destaque
                              </span>
                            )}
                            {!product.hasStock && (
                              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                                Esgotado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <div className="mb-2">
                            <Link
                              href={`/produto/${product.slug}`}
                              className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
                            >
                              {product.category.name}
                            </Link>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            <Link
                              href={`/produto/${product.slug}`}
                              className="hover:text-pink-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                          </h3>

                          {/* Rating */}
                          {product.reviewCount > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {product.averageRating.toFixed(1)} ({product.reviewCount})
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {product.minPrice < product.basePrice ? (
                                <>
                                  <span className="text-sm text-gray-500 line-through">
                                    R$ {product.basePrice.toFixed(2)}
                                  </span>
                                  <span className="text-lg font-bold text-pink-600">
                                    R$ {product.minPrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-pink-600">
                                  R$ {product.basePrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Available sizes */}
                            {product.availableSizes.length > 0 && (
                              <div className="flex gap-1">
                                {product.availableSizes.slice(0, 3).map(size => (
                                  <span
                                    key={size}
                                    className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={loading}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Carregando...' : 'Carregar mais produtos'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h2>
                <p className="text-gray-600 mb-8">
                  Tente ajustar seus filtros ou buscar por outros termos
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  )
}