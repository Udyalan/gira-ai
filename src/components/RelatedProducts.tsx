'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface RelatedProduct {
  id: string
  name: string
  slug: string
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
  variants: Array<{
    id: string
    size: string
    color: string
    stock: number
    price: number
  }>
}

interface RelatedProductsProps {
  productId: string
  type?: 'RELATED' | 'RECOMMENDED' | 'UPSELL' | 'CROSS_SELL' | 'COMPLETE_LOOK'
  title?: string
  limit?: number
  className?: string
}

const typeConfig = {
  RELATED: {
    title: 'Produtos Relacionados',
    description: 'Outros produtos que você pode gostar'
  },
  RECOMMENDED: {
    title: 'Recomendados para Você',
    description: 'Baseado no seu histórico'
  },
  UPSELL: {
    title: 'Versões Premium',
    description: 'Produtos com melhor qualidade'
  },
  CROSS_SELL: {
    title: 'Complete seu Look',
    description: 'Produtos que combinam perfeitamente'
  },
  COMPLETE_LOOK: {
    title: 'Complete o Look',
    description: 'Combine com estes produtos'
  }
}

export default function RelatedProducts({ 
  productId, 
  type = 'RELATED', 
  title, 
  limit = 8,
  className = '' 
}: RelatedProductsProps) {
  const { data: session } = useSession()
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const config = typeConfig[type]
  const displayTitle = title || config.title

  useEffect(() => {
    fetchRelatedProducts()
    if (session) {
      fetchWishlist()
    }
  }, [productId, type, limit, session])

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/products/related/${productId}?type=${type}&limit=${limit}`)
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        throw new Error('Failed to fetch related products')
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        const wishlistIds = new Set(data.map((item: any) => item.productId))
        setWishlist(wishlistIds)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const toggleWishlist = async (productId: string) => {
    if (!session) {
      toast.error('Faça login para adicionar aos favoritos')
      return
    }

    try {
      const isInWishlist = wishlist.has(productId)
      
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'POST'
        })
        if (response.ok) {
          setWishlist(prev => {
            const newSet = new Set(prev)
            newSet.delete(productId)
            return newSet
          })
          toast.success('Removido dos favoritos')
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        })
        if (response.ok) {
          setWishlist(prev => new Set(prev).add(productId))
          toast.success('Adicionado aos favoritos')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Erro ao atualizar favoritos')
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

  const navigateCarousel = (direction: 'prev' | 'next') => {
    const maxIndex = Math.max(0, products.length - 4) // Mostra 4 produtos por vez
    
    if (direction === 'prev') {
      setCurrentIndex(Math.max(0, currentIndex - 1))
    } else {
      setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{displayTitle}</h2>
          <p className="text-gray-600 mt-1">{config.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateCarousel('prev')}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateCarousel('next')}
            disabled={currentIndex >= Math.max(0, products.length - 4)}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Grid/Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * 25}%)` }}
        >
          {products.map((product) => {
            const images = JSON.parse(product.imageUrls)
            const isInWishlist = wishlist.has(product.id)

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 group"
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="relative aspect-square">
                    <Link href={`/produto/${product.slug}`}>
                      <Image
                        src={images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                        isInWishlist 
                          ? 'bg-pink-100 text-pink-600' 
                          : 'bg-white text-gray-400 hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Link
                          href={`/produto/${product.slug}`}
                          className="flex-1 bg-white text-gray-900 py-2 px-3 rounded-md text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mx-auto" />
                        </Link>
                        <button
                          onClick={() => addToCart(product.id, product.variants[0]?.id)}
                          disabled={!product.hasStock}
                          className="flex-1 bg-pink-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>

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
                      {type === 'UPSELL' && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <Link
                        href={`/produto/${product.slug}`}
                        className="text-xs text-gray-500 hover:text-pink-600 transition-colors"
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
                              className={`w-3 h-3 ${
                                i < Math.floor(product.averageRating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {product.averageRating.toFixed(1)} ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Price */}
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

                      {/* Available sizes preview */}
                      {product.variants.length > 0 && (
                        <div className="flex gap-1">
                          {[...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))]
                            .slice(0, 3)
                            .map(size => (
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
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2 lg:hidden">
        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / 2) === index ? 'bg-pink-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* View All Link */}
      {products.length >= limit && (
        <div className="text-center mt-8">
          <Link
            href={`/produtos?category=${products[0]?.category.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-50 text-pink-600 font-medium rounded-lg hover:bg-pink-100 transition-colors"
          >
            Ver todos os produtos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  )
}