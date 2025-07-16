import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Malíbi - Lingerie Feminina',
  description: 'Lingerie feminina com qualidade e elegância. Realce sua beleza natural com nossas peças exclusivas.',
  keywords: 'lingerie, sutiã, calcinha, conjunto, body, feminino, íntimo',
  authors: [{ name: 'Malíbi' }],
  creator: 'Malíbi',
  publisher: 'Malíbi',
  openGraph: {
    title: 'Malíbi - Lingerie Feminina',
    description: 'Lingerie feminina com qualidade e elegância. Realce sua beleza natural com nossas peças exclusivas.',
    url: 'https://malibi.vercel.app',
    siteName: 'Malíbi',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Malíbi - Lingerie Feminina',
    description: 'Lingerie feminina com qualidade e elegância.',
    creator: '@malibi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}