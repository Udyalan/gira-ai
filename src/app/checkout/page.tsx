'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock,
  ArrowLeft,
  CheckCircle 
} from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Info, 2: Payment, 3: Success

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    paymentMethod: 'credit_card'
  })

  const [errors, setErrors] = useState<any>({})
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      fetchCartItems()
      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        customerName: session?.user?.name || '',
        customerEmail: session?.user?.email || ''
      }))
    }
  }, [status, router, session])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
        if (data.length === 0) {
          router.push('/carrinho')
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
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

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.customerName.trim()) newErrors.customerName = 'Nome é obrigatório'
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email é obrigatório'
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Telefone é obrigatório'
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Endereço é obrigatório'
    if (!formData.shippingCity.trim()) newErrors.shippingCity = 'Cidade é obrigatória'
    if (!formData.shippingState.trim()) newErrors.shippingState = 'Estado é obrigatório'
    if (!formData.shippingZip.trim()) newErrors.shippingZip = 'CEP é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2)
    }
  }

  const createOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        return data.order
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  const handlePayment = async () => {
    setProcessing(true)

    try {
      // Create order first
      const order = await createOrder()
      setOrderId(order.id)

      if (formData.paymentMethod === 'pix') {
        // For PIX, just mark as pending and show success
        setStep(3)
      } else {
        // For credit card, use Stripe
        const stripe = await stripePromise
        if (!stripe) throw new Error('Stripe not loaded')

        // Create payment intent
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: getCartTotal(),
            orderId: order.id
          }),
        })

        if (!response.ok) throw new Error('Failed to create payment intent')

        const { clientSecret } = await response.json()

        // Redirect to Stripe Checkout or handle payment
        // For simplicity, we'll just mark as success for demo
        setStep(3)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malibi-rose-600"></div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi realizado com sucesso. Você receberá um email de confirmação em breve.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Número do pedido: <span className="font-mono">{orderId.slice(-8).toUpperCase()}</span>
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/pedidos')}
              className="w-full bg-malibi-rose-600 text-white font-semibold py-3 rounded-md hover:bg-malibi-rose-700 transition-colors"
            >
              Ver Meus Pedidos
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              Voltar ao Início
            </button>
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
          <button
            onClick={() => step === 1 ? router.push('/carrinho') : setStep(1)}
            className="inline-flex items-center text-malibi-rose-600 hover:text-malibi-rose-700 font-medium transition-colors mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            {step === 1 ? 'Voltar ao Carrinho' : 'Voltar'}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          
          {/* Progress Steps */}
          <div className="mt-6 flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-malibi-rose-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 1 ? 'border-malibi-rose-600 bg-malibi-rose-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Informações</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-malibi-rose-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 2 ? 'border-malibi-rose-600 bg-malibi-rose-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações de Entrega</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.customerName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome completo"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.customerEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.customerPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.shippingZip ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="00000-000"
                    />
                    {errors.shippingZip && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingZip}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Rua, Número, Complemento"
                    />
                    {errors.shippingAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.shippingCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Sua cidade"
                    />
                    {errors.shippingCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingCity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500 ${
                        errors.shippingState ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione o estado</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      {/* Add more states as needed */}
                    </select>
                    {errors.shippingState && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingState}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-malibi-rose-600 text-white font-semibold py-3 rounded-md hover:bg-malibi-rose-700 transition-colors"
                >
                  Continuar para Pagamento
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Forma de Pagamento</h2>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                      />
                      <CreditCard className="ml-3 mr-2 w-5 h-5" />
                      <span className="font-medium">Cartão de Crédito</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2 ml-7">
                      Pagamento seguro via Stripe
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-malibi-rose-600 border-gray-300 focus:ring-malibi-rose-500"
                      />
                      <div className="ml-3 mr-2 w-5 h-5 bg-cyan-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        PIX
                      </div>
                      <span className="font-medium">PIX</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2 ml-7">
                      Pagamento instantâneo
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">
                      Seus dados estão protegidos com criptografia SSL
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full mt-6 bg-malibi-rose-600 text-white font-semibold py-3 rounded-md hover:bg-malibi-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Processando...' : `Finalizar Pedido - R$ ${getCartTotal().toFixed(2).replace('.', ',')}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const images = getProductImages(item.product.imageUrls)
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {images.length > 0 && (
                          <Image
                            src={images[0]}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-gray-500">
                            {item.variant.size} • {item.variant.color}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Qtd: {item.quantity} × R$ {getItemPrice(item).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900">
                        R$ {getItemTotal(item).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )
                })}
              </div>
              
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium text-green-600">
                    {getCartTotal() >= 150 ? 'Grátis' : 'A calcular'}
                  </span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}