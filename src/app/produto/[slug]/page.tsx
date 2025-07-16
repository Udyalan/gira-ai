'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

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

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        // Auto-select first available variant
        if (data.variants.length > 0) {
          const firstAvailable = data.variants.find((v: any) => v.stock > 0)
          if (firstAvailable) {
            setSelectedVariant(firstAvailable.id)
          }
        }
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/404')
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

  const getSelectedVariant = () => {
    return product?.variants.find(v => v.id === selectedVariant)
  }

  const getCurrentPrice = () => {
    const variant = getSelectedVariant()
    return variant?.price || Number(product?.basePrice) || 0
  }

  const getAvailableStock = () => {
    const variant = getSelectedVariant()
    return variant?.stock || 0
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!selectedVariant || !product) {
      alert('Por favor, selecione uma variação do produto')
      return
    }

    if (getAvailableStock() < quantity) {
      alert('Quantidade não disponível em estoque')
      return
    }

    setAddingToCart(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant,
          quantity,
        }),
      })

      if (response.ok) {
        alert('Produto adicionado ao carrinho!')
        // You could also update a cart context here
      } else {
        throw new Error('Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Erro ao adicionar ao carrinho. Tente novamente.')
    } finally {
      setAddingToCart(false)
    }
  }

  const nextImage = () => {
    const images = getProductImages(product?.imageUrls || '[]')
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getProductImages(product?.imageUrls || '[]')
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getUniqueValues = (key: 'size' | 'color') => {
    if (!product) return []
    return [...new Set(product.variants.map(v => v[key]))]
  }

  const getVariantByAttributes = (size: string, color: string) => {
    return product?.variants.find(v => v.size === size && v.color === color)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Produto não encontrado</h1>
          <Link href="/produtos" className="text-malibi-rose-600 hover:text-malibi-rose-500 mt-4 inline-block">
            Voltar para produtos
          </Link>
        </div>
      </div>
    )
  }

  const images = getProductImages(product.imageUrls)
  const currentPrice = getCurrentPrice()
  const hasDiscount = currentPrice < Number(product.basePrice)
  const selectedVariantData = getSelectedVariant()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Início
            </Link>
          </li>
          <li>
            <span className="text-gray-500">/</span>
          </li>
          <li>
            <Link
              href={`/categoria/${product.category.slug}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {product.category.name}
            </Link>
          </li>
          <li>
            <span className="text-gray-500">/</span>
          </li>
          <li>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Product Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {images.length > 0 && (
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-malibi-rose-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            <p className="text-sm text-malibi-rose-600 font-medium uppercase tracking-wide mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-malibi-gold-400 text-malibi-gold-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) 127 avaliações</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                R$ {currentPrice.toFixed(2).replace('.', ',')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    R$ {Number(product.basePrice).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="bg-malibi-rose-500 text-white px-2 py-1 rounded text-sm font-medium">
                    -{Math.round(((Number(product.basePrice) - currentPrice) / Number(product.basePrice)) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Variants Selection */}
          <div className="space-y-4">
            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tamanho</h3>
              <div className="flex flex-wrap gap-2">
                {getUniqueValues('size').map((size) => {
                  const isSelected = selectedVariantData?.size === size
                  const hasStock = product.variants.some(v => v.size === size && v.stock > 0)
                  
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (hasStock) {
                          const color = selectedVariantData?.color || getUniqueValues('color')[0]
                          const variant = getVariantByAttributes(size, color)
                          if (variant) setSelectedVariant(variant.id)
                        }
                      }}
                      disabled={!hasStock}
                      className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                        isSelected
                          ? 'border-malibi-rose-500 bg-malibi-rose-500 text-white'
                          : hasStock
                          ? 'border-gray-300 text-gray-700 hover:border-malibi-rose-500'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cor</h3>
              <div className="flex flex-wrap gap-2">
                {getUniqueValues('color').map((color) => {
                  const isSelected = selectedVariantData?.color === color
                  const hasStock = product.variants.some(v => v.color === color && v.stock > 0)
                  
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        if (hasStock) {
                          const size = selectedVariantData?.size || getUniqueValues('size')[0]
                          const variant = getVariantByAttributes(size, color)
                          if (variant) setSelectedVariant(variant.id)
                        }
                      }}
                      disabled={!hasStock}
                      className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                        isSelected
                          ? 'border-malibi-rose-500 bg-malibi-rose-500 text-white'
                          : hasStock
                          ? 'border-gray-300 text-gray-700 hover:border-malibi-rose-500'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stock Info */}
            {selectedVariantData && (
              <div className="text-sm">
                {getAvailableStock() > 0 ? (
                  <span className="text-green-600">
                    ✓ {getAvailableStock()} unidades disponíveis
                  </span>
                ) : (
                  <span className="text-red-600">
                    ✗ Fora de estoque
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantidade</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-md"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                    className="p-2 hover:bg-gray-100 rounded-r-md"
                    disabled={quantity >= getAvailableStock()}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Máximo: {getAvailableStock()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || getAvailableStock() === 0 || addingToCart}
                className="flex-1 bg-malibi-rose-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-malibi-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {addingToCart ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingBag size={20} className="mr-2" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-malibi-rose-600" />
                <span className="text-sm text-gray-600">Frete grátis acima de R$ 150</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-malibi-rose-600" />
                <span className="text-sm text-gray-600">Troca garantida em até 30 dias</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-malibi-rose-600" />
                <span className="text-sm text-gray-600">Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}