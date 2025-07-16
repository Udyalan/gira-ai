'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Sem imagem disponível</span>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
          <Image
            src={images[currentImageIndex]}
            alt={`${productName} - Imagem principal`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Zoom button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Ampliar imagem"
          >
            <Expand size={20} />
          </button>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Ver imagem ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex ? 'border-malibi-rose-500' : 'border-transparent'
                }`}
                aria-label={`Ver imagem ${index + 1} de ${productName}`}
              >
                <Image
                  src={image}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white text-xl hover:text-gray-300"
              aria-label="Fechar visualização ampliada"
            >
              ✕
            </button>
            
            <div className="relative">
              <Image
                src={images[currentImageIndex]}
                alt={`${productName} - Visualização ampliada`}
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}