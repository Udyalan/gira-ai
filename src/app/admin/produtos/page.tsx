'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Filter,
  ArrowLeft
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  imageUrls: string
  featured: boolean
  active: boolean
  createdAt: string
  category: {
    id: string
    name: string
  }
  variants: Array<{
    id: string
    size: string
    color: string
    price: number | null
    stock: number
  }>
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [showMenu, setShowMenu] = useState<string | null>(null)

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
      fetchProducts()
      fetchCategories()
    }
  }, [status, session, router])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, statusFilter])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category.id === selectedCategory)
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.active)
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(product => !product.active)
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter(product => product.featured)
      }
    }

    setFilteredProducts(filtered)
  }

  const toggleProductStatus = async (productId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      })

      if (response.ok) {
        setProducts(prev =>
          prev.map(product =>
            product.id === productId ? { ...product, active } : product
          )
        )
      }
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(prev => prev.filter(product => product.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getProductImages = (imageUrls: string) => {
    try {
      return JSON.parse(imageUrls)
    } catch {
      return []
    }
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTotalStock = (variants: Product['variants']) => {
    return variants.reduce((total, variant) => total + variant.stock, 0)
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
          <Link
            href="/admin"
            className="inline-flex items-center text-malibi-rose-600 hover:text-malibi-rose-700 font-medium transition-colors mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
              <p className="text-gray-600 mt-2">{filteredProducts.length} produtos encontrados</p>
            </div>
            
            <Link
              href="/admin/produtos/novo"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-malibi-rose-600 text-white font-semibold rounded-md hover:bg-malibi-rose-700 transition-colors"
            >
              <Plus className="mr-2" size={20} />
              Novo Produto
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou descrição"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="featured">Em destaque</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setStatusFilter('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const images = getProductImages(product.imageUrls)
                  const totalStock = getTotalStock(product.variants)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {images.length > 0 ? (
                              <Image
                                src={images[0]}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Sem imagem</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                            {product.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                Destaque
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(Number(product.basePrice))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          totalStock > 10 ? 'text-green-600' : 
                          totalStock > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {totalStock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical size={20} />
                          </button>
                          
                          {showMenu === product.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <Link
                                  href={`/produto/${product.slug}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="mr-2" size={16} />
                                  Visualizar
                                </Link>
                                <Link
                                  href={`/admin/produtos/${product.id}/editar`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="mr-2" size={16} />
                                  Editar
                                </Link>
                                <button
                                  onClick={() => toggleProductStatus(product.id, !product.active)}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {product.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <Trash2 className="mr-2" size={16} />
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}