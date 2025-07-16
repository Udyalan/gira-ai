'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    totalAmount: number
    status: string
    createdAt: string
  }>
  topProducts: Array<{
    id: string
    name: string
    totalSold: number
    revenue: number
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/')
        return
      }
      fetchDashboardStats()
    }
  }, [status, session, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malibi-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle da Malíbi</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/produtos/novo"
            className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-malibi-rose-100 rounded-lg group-hover:bg-malibi-rose-200 transition-colors">
                <Plus className="w-6 h-6 text-malibi-rose-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Adicionar</p>
                <p className="text-lg font-semibold text-gray-900">Produto</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/pedidos"
            className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ver</p>
                <p className="text-lg font-semibold text-gray-900">Pedidos</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/produtos"
            className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gerenciar</p>
                <p className="text-lg font-semibold text-gray-900">Produtos</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/configuracoes"
            className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ver</p>
                <p className="text-lg font-semibold text-gray-900">Configurações</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-malibi-rose-100 rounded-lg">
                  <Users className="w-8 h-8 text-malibi-rose-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                <Link
                  href="/admin/pedidos"
                  className="text-malibi-rose-600 hover:text-malibi-rose-700 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {stats?.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Produtos Mais Vendidos</h2>
                <Link
                  href="/admin/relatorios"
                  className="text-malibi-rose-600 hover:text-malibi-rose-700 text-sm font-medium"
                >
                  Ver relatório
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {stats?.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
              ) : (
                <div className="space-y-4">
                  {stats?.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-malibi-rose-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-malibi-rose-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.totalSold} vendas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">+{((product.revenue / stats.totalRevenue) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}