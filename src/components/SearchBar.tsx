'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, TrendingUp, Clock, Tag } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  id: string
  name: string
  slug: string
  basePrice: number
  imageUrls: string
  type: 'product' | 'category'
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  showTrending?: boolean
}

export default function SearchBar({ 
  className = '', 
  placeholder = 'Buscar produtos...',
  showTrending = true 
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<{ products: SearchResult[], categories: SearchResult[] }>({
    products: [],
    categories: []
  })
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches] = useState([
    'lingerie sexy',
    'conjunto de renda',
    'body elegante',
    'pijama confortável',
    'sutiã sem bojo'
  ])

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    // Carregar pesquisas recentes do localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Fechar resultados quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchProducts()
    } else {
      setResults({ products: [], categories: [] })
      setLoading(false)
    }
  }, [debouncedQuery])

  const searchProducts = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&autocomplete=true`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    
    if (finalQuery.trim()) {
      // Adicionar à lista de pesquisas recentes
      const newRecentSearches = [
        finalQuery,
        ...recentSearches.filter(s => s !== finalQuery)
      ].slice(0, 5)
      
      setRecentSearches(newRecentSearches)
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
      
      // Navegar para página de resultados
      router.push(`/produtos?q=${encodeURIComponent(finalQuery)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'product') {
      router.push(`/produto/${result.slug}`)
    } else {
      router.push(`/produtos?category=${result.slug}`)
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults({ products: [], categories: [] })
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-4"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Buscando...</p>
            </div>
          )}

          {/* Search Results */}
          {!loading && query.length >= 2 && (results.products.length > 0 || results.categories.length > 0) && (
            <>
              {/* Categories */}
              {results.categories.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Categorias
                  </div>
                  {results.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleResultClick(category)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Produtos
                  </div>
                  {results.products.map((product) => {
                    const images = JSON.parse(product.imageUrls)
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 flex-shrink-0">
                          <Image
                            src={images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow text-left">
                          <p className="text-gray-900 text-sm font-medium line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-pink-600 text-sm font-semibold">
                            R$ {product.basePrice.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Ver todos resultados */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => handleSearch()}
                  className="w-full p-3 text-center text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  Ver todos os resultados para "{query}"
                </button>
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && query.length >= 2 && results.products.length === 0 && results.categories.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-3">Nenhum resultado encontrado para "{query}"</p>
              <button
                onClick={() => handleSearch()}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Buscar mesmo assim
              </button>
            </div>
          )}

          {/* Default State - Recent & Trending */}
          {!loading && query.length < 2 && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Pesquisas Recentes
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Limpar
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {showTrending && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Pesquisas Populares
                  </div>
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}