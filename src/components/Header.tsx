'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X,
  Heart
} from 'lucide-react'

const categories = [
  { name: 'Conjuntos', slug: 'conjuntos' },
  { name: 'Calcinhas', slug: 'calcinhas' },
  { name: 'Sutiãs', slug: 'sutias' },
  { name: 'Bodies', slug: 'bodies' },
  { name: 'Acessórios', slug: 'acessorios' }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = useSession()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/produtos?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-malibi-rose-500 text-white text-center py-2 text-sm">
        Frete grátis para compras acima de R$ 150 💕
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-malibi-rose-600">
              Malíbi
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="text-gray-700 hover:text-malibi-rose-600 font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              href="/favoritos"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart size={20} />
            </Link>

            {/* User menu */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User size={20} />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                {session ? (
                  <>
                    <Link
                      href="/conta"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Minha Conta
                    </Link>
                    <Link
                      href="/pedidos"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Meus Pedidos
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cadastrar
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Shopping cart */}
            <Link 
              href="/carrinho"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingBag size={20} />
              {/* Cart count badge */}
              <span className="absolute -top-1 -right-1 bg-malibi-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-malibi-rose-500 text-white rounded-r-md hover:bg-malibi-rose-600 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-4 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="block py-2 text-gray-700 hover:text-malibi-rose-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}