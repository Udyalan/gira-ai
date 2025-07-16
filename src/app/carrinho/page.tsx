'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    imageUrls: string
    category: {
      name: string
    }
  }
  variant?: {
    id: string
    size: string
    color: string
    price: number | null
  }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      fetchCartItems()
    }
  }, [status, router])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        )
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getItemPrice = (item: CartItem) => {
    return item.variant?.price || Number(item.product.basePrice)
  }

  const getItemTotal = (item: CartItem) => {
    return getItemPrice(item) * item.quantity
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + getItemTotal(item), 0)
  }

  const getProductImages = (imageUrls: string) => {
    try {
      return JSON.parse(imageUrls)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malibi-rose-600"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Seu carrinho está vazio</h2>
            <p className="mt-2 text-gray-600">Que tal adicionar alguns produtos incríveis?</p>
            <Link
              href="/produtos"
              className="mt-8 inline-flex items-center px-6 py-3 bg-malibi-rose-600 text-white font-semibold rounded-md hover:bg-malibi-rose-700 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no seu carrinho</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Seus Produtos</h2>
              </div>
              
              <div className="divide-y">
                {cartItems.map((item) => {
                  const images = getProductImages(item.product.imageUrls)
                  const isUpdating = updating === item.id
                  
                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          {images.length > 0 && (
                            <Image
                              src={images[0]}
                              alt={item.product.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-malibi-rose-600 font-medium uppercase tracking-wide">
                                {item.product.category.name}
                              </p>
                              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                                <Link 
                                  href={`/produto/${item.product.slug}`}
                                  className="hover:text-malibi-rose-600 transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              {item.variant && (
                                <div className="mt-1 text-sm text-gray-600">
                                  <span>Tamanho: {item.variant.size}</span>
                                  <span className="mx-2">•</span>
                                  <span>Cor: {item.variant.color}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={isUpdating}
                              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                  {isUpdating ? '...' : item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={isUpdating}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                R$ {getItemPrice(item).toFixed(2).replace('.', ',')} cada
                              </p>
                              <p className="text-lg font-bold text-gray-900">
                                R$ {getItemTotal(item).toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/produtos"
                className="inline-flex items-center text-malibi-rose-600 hover:text-malibi-rose-700 font-medium transition-colors"
              >
                <ArrowLeft className="mr-2" size={20} />
                Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium text-green-600">
                    {getCartTotal() >= 150 ? 'Grátis' : 'Calcular'}
                  </span>
                </div>
                
                {getCartTotal() >= 150 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-800 text-sm">
                      🎉 Você ganhou frete grátis!
                    </p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full mt-6 bg-malibi-rose-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-malibi-rose-700 transition-colors flex items-center justify-center"
              >
                Finalizar Compra
                <ArrowRight className="ml-2" size={20} />
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Compra 100% segura e protegida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}