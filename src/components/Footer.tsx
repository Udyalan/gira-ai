import Link from 'next/link'
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-malibi-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-malibi-rose-300">Malíbi</h3>
            <p className="text-malibi-neutral-300 text-sm">
              Lingerie feminina com qualidade e elegância. 
              Realce sua beleza natural com nossas peças exclusivas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-malibi-neutral-400 hover:text-malibi-rose-300 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-malibi-neutral-400 hover:text-malibi-rose-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-malibi-neutral-400 hover:text-malibi-rose-300 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-malibi-rose-300">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categoria/conjuntos" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Conjuntos
                </Link>
              </li>
              <li>
                <Link href="/categoria/calcinhas" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Calcinhas
                </Link>
              </li>
              <li>
                <Link href="/categoria/sutias" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Sutiãs
                </Link>
              </li>
              <li>
                <Link href="/categoria/bodies" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Bodies
                </Link>
              </li>
              <li>
                <Link href="/categoria/acessorios" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-malibi-rose-300">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/conta" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link href="/pedidos" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Meus Pedidos
                </Link>
              </li>
              <li>
                <Link href="/trocas-devolucoes" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/guia-tamanhos" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  Guia de Tamanhos
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-malibi-neutral-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-malibi-rose-300">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-malibi-rose-300" />
                <span className="text-malibi-neutral-300">contato@malibi.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-malibi-rose-300" />
                <span className="text-malibi-neutral-300">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-malibi-rose-300" />
                <span className="text-malibi-neutral-300">São Paulo, SP</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-medium mb-2 text-malibi-rose-300">Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-3 py-2 bg-malibi-neutral-800 border border-malibi-neutral-700 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-malibi-rose-500"
                />
                <button className="px-4 py-2 bg-malibi-rose-500 text-white rounded-r-md hover:bg-malibi-rose-600 transition-colors text-sm">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-malibi-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-malibi-neutral-400 text-sm">
              © 2024 Malíbi. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacidade" className="text-malibi-neutral-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-malibi-neutral-400 hover:text-white text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}