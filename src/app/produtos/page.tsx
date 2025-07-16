'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Star, Filter, Grid, List, ChevronDown } from 'lucide-react'

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
    slug: string
  }
  variants: Array<{
    id: string
    size: string
    color: string
    stock: number
    price: number | null
  }>
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    inStock: false
  })

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || ''

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [searchQuery, categoryFilter, sortBy, filters])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryFilter || filters.category) {
        params.append('category', categoryFilter || filters.category)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      
      let sortedProducts = data.products || []
      
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          sortedProducts.sort((a: Product, b: Product) => Number(a.basePrice) - Number(b.basePrice))
          break
        case 'price-desc':
          sortedProducts.sort((a: Product, b: Product) => Number(b.basePrice) - Number(a.basePrice))
          break
        case 'name':
          sortedProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
          break
        default:
          // newest first (default)
          break
      }

      // Apply filters
      if (filters.inStock) {
        sortedProducts = sortedProducts.filter((product: Product) => 
          product.variants.some(variant => variant.stock > 0)
        )
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number)
        sortedProducts = sortedProducts.filter((product: Product) => {
          const price = Number(product.basePrice)
          return price >= min && price <= max
        })
      }

      setProducts(sortedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
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
    const prices = product.variants
      .map(v => v.price || Number(product.basePrice))
      .filter(price => price > 0)
    
    return prices.length > 0 ? Math.min(...prices) : Number(product.basePrice)
  }

  const hasDiscount = (product: Product) => {
    const basePrice = Number(product.basePrice)
    const lowestPrice = getLowestPrice(product)
    return lowestPrice < basePrice
  }

  const getDiscountPercentage = (product: Product) => {
    const basePrice = Number(product.basePrice)
    const lowestPrice = getLowestPrice(product)
    return Math.round(((basePrice - lowestPrice) / basePrice) * 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {searchQuery ? `Resultados para "${searchQuery}"` : 
           categoryFilter ? `Categoria: ${categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}` : 
           'Todos os Produtos'}
        </h1>
        <p className="text-gray-600">
          Descubra nossa coleção completa de lingerie feminina
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter size={20} className="mr-2" />
              Filtros
            </h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Categorias</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={filters.category === ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Todas</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={filters.category === category.slug}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Faixa de Preço</h4>
              <div className="space-y-2">
                {[
                  { label: 'Até R$ 50', value: '0-50' },
                  { label: 'R$ 50 - R$ 100', value: '50-100' },
                  { label: 'R$ 100 - R$ 150', value: '100-150' },
                  { label: 'Acima de R$ 150', value: '150-9999' },
                ].map((range) => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.value}
                      checked={filters.priceRange === range.value}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                      className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{range.label}</span>
                  </label>
                ))}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    value=""
                    checked={filters.priceRange === ''}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Todos os preços</span>
                </label>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="w-4 h-4 text-malibi-rose-600 border-gray-300 rounded focus:ring-malibi-rose-500"
                />
                <span className="ml-2 text-sm text-gray-600">Apenas em estoque</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Ordenar por:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                    <option value="name">Nome A-Z</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-malibi-rose-100 text-malibi-rose-600' : 'text-gray-400'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-malibi-rose-100 text-malibi-rose-600' : 'text-gray-400'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malibi-rose-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou buscar por outros termos</p>
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
                const discount = hasDiscount(product)
                
                return (
                  <Link
                    key={product.id}
                    href={`/produto/${product.slug}`}
                    className={`group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
                    }`}
                  >
                    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${
                      viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-[3/4] mb-4'
                    }`}>
                      {images.length > 0 && (
                        <Image
                          src={images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {discount && (
                        <div className="absolute top-2 left-2 bg-malibi-rose-500 text-white px-2 py-1 rounded text-xs font-medium">
                          -{getDiscountPercentage(product)}%
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-2 right-2 bg-malibi-gold-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Destaque
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-malibi-rose-600 font-medium uppercase tracking-wide">
                        {product.category.name}
                      </p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-malibi-rose-600 transition-colors">
                        {product.name}
                      </h3>
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          R$ {lowestPrice.toFixed(2).replace('.', ',')}
                        </span>
                        {discount && (
                          <span className="text-sm text-gray-500 line-through">
                            R$ {Number(product.basePrice).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-malibi-gold-400 text-malibi-gold-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                      </div>
                      {/* Available sizes preview */}
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(product.variants.map(v => v.size))].slice(0, 4).map((size) => (
                          <span key={size} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                        {[...new Set(product.variants.map(v => v.size))].length > 4 && (
                          <span className="text-xs text-gray-400">+mais</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}