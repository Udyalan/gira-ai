'use client'

import { useState } from 'react'
import { X, Ruler, HelpCircle } from 'lucide-react'

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
  category?: string
}

interface SizeData {
  size: string
  bust: string
  waist: string
  hips: string
  torso?: string
}

const sizeData: Record<string, SizeData[]> = {
  lingerie: [
    { size: 'PP', bust: '78-82', waist: '58-62', hips: '84-88', torso: '52-54' },
    { size: 'P', bust: '82-86', waist: '62-66', hips: '88-92', torso: '54-56' },
    { size: 'M', bust: '86-90', waist: '66-70', hips: '92-96', torso: '56-58' },
    { size: 'G', bust: '90-94', waist: '70-74', hips: '96-100', torso: '58-60' },
    { size: 'GG', bust: '94-98', waist: '74-78', hips: '100-104', torso: '60-62' },
    { size: 'XGG', bust: '98-102', waist: '78-82', hips: '104-108', torso: '62-64' }
  ],
  sleepwear: [
    { size: 'PP', bust: '78-82', waist: '58-62', hips: '84-88' },
    { size: 'P', bust: '82-86', waist: '62-66', hips: '88-92' },
    { size: 'M', bust: '86-90', waist: '66-70', hips: '92-96' },
    { size: 'G', bust: '90-94', waist: '70-74', hips: '96-100' },
    { size: 'GG', bust: '94-98', waist: '74-78', hips: '100-104' },
    { size: 'XGG', bust: '98-102', waist: '78-82', hips: '104-108' }
  ]
}

const measurementTips = [
  {
    title: 'Busto',
    description: 'Meça ao redor da parte mais cheia do busto, mantendo a fita métrica paralela ao chão.'
  },
  {
    title: 'Cintura',
    description: 'Meça na parte mais estreita do tronco, geralmente logo acima do umbigo.'
  },
  {
    title: 'Quadril',
    description: 'Meça ao redor da parte mais larga dos quadris, aproximadamente 20cm abaixo da cintura.'
  },
  {
    title: 'Torso',
    description: 'Meça do ombro até a virilha, passando pela parte mais cheia do busto.'
  }
]

export default function SizeGuide({ isOpen, onClose, category = 'lingerie' }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'calculator' | 'tips'>('table')
  const [measurements, setMeasurements] = useState({
    bust: '',
    waist: '',
    hips: '',
    torso: ''
  })
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null)

  const sizes = sizeData[category] || sizeData.lingerie

  const calculateSize = () => {
    const { bust, waist, hips } = measurements
    
    if (!bust || !waist || !hips) {
      return
    }

    const bustNum = parseFloat(bust)
    const waistNum = parseFloat(waist)
    const hipsNum = parseFloat(hips)

    for (const sizeInfo of sizes) {
      const [bustMin, bustMax] = sizeInfo.bust.split('-').map(Number)
      const [waistMin, waistMax] = sizeInfo.waist.split('-').map(Number)
      const [hipsMin, hipsMax] = sizeInfo.hips.split('-').map(Number)

      if (
        bustNum >= bustMin && bustNum <= bustMax &&
        waistNum >= waistMin && waistNum <= waistMax &&
        hipsNum >= hipsMin && hipsNum <= hipsMax
      ) {
        setRecommendedSize(sizeInfo.size)
        return
      }
    }

    // Se não encontrar tamanho exato, encontrar o mais próximo
    let closestSize = sizes[0]
    let smallestDiff = Infinity

    for (const sizeInfo of sizes) {
      const [bustMin, bustMax] = sizeInfo.bust.split('-').map(Number)
      const bustMid = (bustMin + bustMax) / 2
      const diff = Math.abs(bustNum - bustMid)

      if (diff < smallestDiff) {
        smallestDiff = diff
        closestSize = sizeInfo
      }
    }

    setRecommendedSize(closestSize.size)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Ruler className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">Guia de Tamanhos</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'table' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tabela de Medidas
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calculator' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tips' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Como Medir
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === 'table' && (
              <div>
                <p className="text-gray-600 mb-6">
                  Todas as medidas estão em centímetros. Para melhores resultados, meça com roupas íntimas justas.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-pink-50">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                          Tamanho
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                          Busto (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                          Cintura (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                          Quadril (cm)
                        </th>
                        {sizes[0].torso && (
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                            Torso (cm)
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map((size, index) => (
                        <tr key={size.size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-3 font-semibold text-pink-600">
                            {size.size}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {size.bust}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {size.waist}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {size.hips}
                          </td>
                          {size.torso && (
                            <td className="border border-gray-300 px-4 py-3">
                              {size.torso}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Dicas importantes:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Entre dois tamanhos? Escolha o maior para mais conforto</li>
                        <li>• Cada corpo é único, use como referência</li>
                        <li>• Em caso de dúvida, entre em contato conosco</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div>
                <p className="text-gray-600 mb-6">
                  Insira suas medidas para encontrar o tamanho ideal:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Busto (cm) *
                      </label>
                      <input
                        type="number"
                        value={measurements.bust}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, bust: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="ex: 86"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cintura (cm) *
                      </label>
                      <input
                        type="number"
                        value={measurements.waist}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="ex: 66"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quadril (cm) *
                      </label>
                      <input
                        type="number"
                        value={measurements.hips}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="ex: 92"
                      />
                    </div>

                    {sizes[0].torso && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Torso (cm)
                        </label>
                        <input
                          type="number"
                          value={measurements.torso}
                          onChange={(e) => setMeasurements(prev => ({ ...prev, torso: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="ex: 56"
                        />
                      </div>
                    )}

                    <button
                      onClick={calculateSize}
                      className="w-full px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
                    >
                      Calcular Tamanho
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    {recommendedSize ? (
                      <div className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="text-6xl font-bold text-green-600 mb-2">
                          {recommendedSize}
                        </div>
                        <p className="text-green-800 font-medium">
                          Tamanho recomendado
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Baseado nas suas medidas
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-gray-400">
                        <Ruler className="w-16 h-16 mx-auto mb-4" />
                        <p>Preencha suas medidas para ver a recomendação</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div>
                <p className="text-gray-600 mb-6">
                  Aprenda como tirar suas medidas corretamente para garantir o tamanho perfeito:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {measurementTips.map((tip, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-pink-600 text-white text-sm rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-pink-900 mb-3">Dicas Gerais:</h3>
                  <ul className="text-sm text-pink-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">•</span>
                      Use uma fita métrica flexível, não muito apertada nem muito frouxa
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">•</span>
                      Peça ajuda de alguém para medidas mais precisas
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">•</span>
                      Meça sempre sobre roupas íntimas justas
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">•</span>
                      Mantenha a postura ereta e natural durante as medições
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Ainda com dúvidas? Entre em contato conosco pelo WhatsApp ou email
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}