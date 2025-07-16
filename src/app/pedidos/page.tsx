'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  ArrowLeft
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      slug: string
      imageUrls: string
    }
    variant?: {
      size: string
      color: string
    }
  }>
}

const statusConfig = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const paymentStatusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malibi-rose-600"></div>
      </div>
    )
  }

  if (selectedOrder) {
    const statusInfo = statusConfig[selectedOrder.status as keyof typeof statusConfig]
    const paymentInfo = paymentStatusConfig[selectedOrder.paymentStatus as keyof typeof paymentStatusConfig]
    const StatusIcon = statusInfo?.icon || Package

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedOrder(null)}
            className="inline-flex items-center text-malibi-rose-600 hover:text-malibi-rose-700 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar aos Pedidos
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pedido #{selectedOrder.orderNumber}
                </h1>
                <p className="text-gray-600 mt-1">
                  Realizado em {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <StatusIcon size={16} />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
                    {statusInfo?.label}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentInfo?.color}`}>
                  Pagamento: {paymentInfo?.label}
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
              
              <div className="space-y-4">
                {selectedOrder.orderItems.map((item) => {
                  const images = getProductImages(item.product.imageUrls)
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {images.length > 0 && (
                          <Image
                            src={images[0]}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          <Link 
                            href={`/produto/${item.product.slug}`}
                            className="hover:text-malibi-rose-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            Tamanho: {item.variant.size} • Cor: {item.variant.color}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          R$ {(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-gray-600">
                          R$ {Number(item.price).toFixed(2).replace('.', ',')} cada
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total do Pedido</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {Number(selectedOrder.totalAmount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-600 mt-2">Acompanhe o status dos seus pedidos</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Nenhum pedido encontrado</h2>
            <p className="mt-2 text-gray-600">Você ainda não fez nenhum pedido.</p>
            <Link
              href="/produtos"
              className="mt-8 inline-flex items-center px-6 py-3 bg-malibi-rose-600 text-white font-semibold rounded-md hover:bg-malibi-rose-700 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Começar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
              const paymentInfo = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]
              const StatusIcon = statusInfo?.icon || Package
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <StatusIcon size={16} />
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
                            {statusInfo?.label}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentInfo?.color}`}>
                          {paymentInfo?.label}
                        </span>
                      </div>

                      {/* Preview dos produtos */}
                      <div className="mt-4 flex space-x-2">
                        {order.orderItems.slice(0, 3).map((item, index) => {
                          const images = getProductImages(item.product.imageUrls)
                          
                          return (
                            <div key={index} className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                              {images.length > 0 && (
                                <Image
                                  src={images[0]}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )
                        })}
                        {order.orderItems.length > 3 && (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center px-4 py-2 border border-malibi-rose-600 text-malibi-rose-600 font-medium rounded-md hover:bg-malibi-rose-50 transition-colors"
                      >
                        <Eye className="mr-2" size={16} />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}