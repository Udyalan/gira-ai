'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, Star, Filter, Grid, List } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface WishlistItem {
  id: string
  productId: string
  addedAt: string
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    imageUrls: string
    category: {
      name: string
      slug: string
    }
    hasStock: boolean
    averageRating: number
    reviewCount: number
    variants: Array<{
      id: string
      size: string
      color: string
      stock: number
      price: number
    }>
  }
}

export default function FavoritosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      } else {
        throw new Error('Failed to fetch wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Erro ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setWishlistItems(prev => prev.filter(item => item.productId !== productId))
        toast.success(result.message || 'Removido dos favoritos')
      } else {
        throw new Error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Erro ao remover dos favoritos')
    }
  }

  const addToCart = async (productId: string, variantId?: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1
        })
      })

      if (response.ok) {
        toast.success('Adicionado ao carrinho!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Erro ao adicionar ao carrinho')
    }
  }

  // Filtrar e ordenar itens
  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      if (filterCategory && item.product.category.slug !== filterCategory) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name)
        case 'price_asc':
          return a.product.basePrice - b.product.basePrice
        case 'price_desc':
          return b.product.basePrice - a.product.basePrice
        case 'rating':
          return b.product.averageRating - a.product.averageRating
        default: // recent
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      }
    })

  const categories = [...new Set(wishlistItems.map(item => item.product.category))]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
          <p className="text-gray-600">
            {wishlistItems.length === 0 
              ? 'Você ainda não tem produtos favoritos' 
              : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'produto favoritado' : 'produtos favoritados'}`
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explore nossa coleção e adicione produtos aos seus favoritos clicando no ícone de coração
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <>
            {/* Filtros e Controles */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-4">
                  {/* Filtro por categoria */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {/* Ordenação */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="recent">Mais recentes</option>
                    <option value="name">Nome A-Z</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="rating">Melhor avaliados</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {filteredAndSortedItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                  {/* Imagem do Produto */}
                  <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'}`}>
                    <Link href={`/produto/${item.product.slug}`}>
                      <Image
                        src={JSON.parse(item.product.imageUrls)[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Botão de remover */}
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Badge de estoque */}
                    {!item.product.hasStock && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                        Esgotado
                      </div>
                    )}
                  </div>

                  {/* Informações do Produto */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="mb-2">
                      <Link
                        href={`/produto/${item.product.slug}`}
                        className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
                      >
                        {item.product.category.name}
                      </Link>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link
                        href={`/produto/${item.product.slug}`}
                        className="hover:text-pink-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                    </h3>

                    {/* Rating */}
                    {item.product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(item.product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {item.product.averageRating.toFixed(1)} ({item.product.reviewCount})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pink-600">
                        R$ {item.product.basePrice.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => addToCart(item.productId, item.product.variants[0]?.id)}
                        disabled={!item.product.hasStock}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {viewMode === 'grid' ? '' : 'Adicionar'}
                      </button>
                    </div>

                    {viewMode === 'list' && (
                      <div className="mt-3 text-sm text-gray-500">
                        Adicionado em {new Date(item.addedAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}