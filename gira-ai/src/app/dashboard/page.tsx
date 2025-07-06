'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Brain, 
  BarChart, 
  MessageSquare, 
  TrendingUp, 
  Upload, 
  Send,
  Calendar,
  FileText,
  Bell,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { formatCurrency, parseCSV } from '@/lib/utils'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Estados para análise financeira
  const [csvData, setCsvData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  
  // Estados para geração de conteúdo
  const [contentForm, setContentForm] = useState({
    businessInfo: '',
    contentType: 'instagram',
    topic: '',
    tone: 'amigável',
    targetAudience: '',
    callToAction: ''
  })
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [contentLoading, setContentLoading] = useState(false)
  
  // Estados para WhatsApp
  const [whatsappForm, setWhatsappForm] = useState({
    phoneNumber: '',
    appointmentTime: '',
    serviceName: '',
    type: 'reminder'
  })
  const [whatsappLoading, setWhatsappLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push('/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Função para fazer upload e análise de CSV
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const data = parseCSV(text)
    setCsvData(data)
  }

  const analyzeFinancialData = async () => {
    if (csvData.length === 0) return
    
    setAnalyzeLoading(true)
    try {
      const response = await fetch('/api/ai/analyze-financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: csvData,
          businessContext: user?.user_metadata?.business_name || 'Meu negócio'
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setAnalysis(result)
      }
    } catch (error) {
      console.error('Erro na análise:', error)
    } finally {
      setAnalyzeLoading(false)
    }
  }

  // Função para gerar conteúdo
  const generateContent = async () => {
    setContentLoading(true)
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm)
      })
      
      const result = await response.json()
      if (result.success) {
        setGeneratedContent(result)
      }
    } catch (error) {
      console.error('Erro na geração:', error)
    } finally {
      setContentLoading(false)
    }
  }

  // Função para enviar WhatsApp
  const sendWhatsApp = async () => {
    setWhatsappLoading(true)
    try {
      const response = await fetch('/api/whatsapp/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...whatsappForm,
          businessName: user?.user_metadata?.business_name || 'Meu negócio'
        })
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Mensagem enviada com sucesso!')
        setWhatsappForm({
          phoneNumber: '',
          appointmentTime: '',
          serviceName: '',
          type: 'reminder'
        })
      }
    } catch (error) {
      console.error('Erro no WhatsApp:', error)
    } finally {
      setWhatsappLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">gira.ai</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.user_metadata?.name || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: BarChart },
              { id: 'financial', name: 'Análise Financeira', icon: TrendingUp },
              { id: 'content', name: 'Criar Conteúdo', icon: Sparkles },
              { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('financial')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Análise Financeira</CardTitle>
                <BarChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">IA</div>
                <p className="text-xs text-gray-600">
                  Analise suas planilhas com inteligência artificial
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('content')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Criador de Posts</CardTitle>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">IA</div>
                <p className="text-xs text-gray-600">
                  Gere conteúdo para redes sociais automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('whatsapp')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WhatsApp Automático</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">IA</div>
                <p className="text-xs text-gray-600">
                  Envie lembretes e confirmações automaticamente
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Análise Financeira */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-blue-600" />
                  Análise Financeira com IA
                </CardTitle>
                <CardDescription>
                  Faça upload de sua planilha financeira para análise inteligente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload da Planilha (CSV)
                  </label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="mb-4"
                  />
                </div>

                {csvData.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {csvData.length} registros carregados
                    </p>
                    <Button 
                      onClick={analyzeFinancialData}
                      disabled={analyzeLoading}
                      className="w-full sm:w-auto"
                    >
                      {analyzeLoading ? (
                        <>
                          <Brain className="mr-2 h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {analysis && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Receitas</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(analysis.metrics.totalReceitas)}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600">Despesas</p>
                        <p className="text-xl font-bold text-red-700">
                          {formatCurrency(analysis.metrics.totalDespesas)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Lucro</p>
                        <p className="text-xl font-bold text-blue-700">
                          {formatCurrency(analysis.metrics.lucroLiquido)}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Margem</p>
                        <p className="text-xl font-bold text-purple-700">
                          {analysis.metrics.margemLucro}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="font-semibold mb-4">Análise da IA:</h3>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{analysis.analysis}</p>
                      </div>
                    </div>

                    {analysis.insights && analysis.insights.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Insights:</h3>
                        {analysis.insights.map((insight: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              insight.type === 'warning' ? 'bg-red-50 text-red-700' :
                              insight.type === 'success' ? 'bg-green-50 text-green-700' :
                              insight.type === 'info' ? 'bg-blue-50 text-blue-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            <p className="font-medium">{insight.title}</p>
                            <p className="text-sm">{insight.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Geração de Conteúdo */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                  Gerador de Conteúdo para Redes Sociais
                </CardTitle>
                <CardDescription>
                  Use IA para criar posts envolventes para suas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Informações do Negócio
                    </label>
                    <Input
                      placeholder="Ex: Salão de beleza no centro da cidade"
                      value={contentForm.businessInfo}
                      onChange={(e) => setContentForm({...contentForm, businessInfo: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de Conteúdo
                    </label>
                    <select
                      value={contentForm.contentType}
                      onChange={(e) => setContentForm({...contentForm, contentType: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tópico/Assunto
                    </label>
                    <Input
                      placeholder="Ex: Promoção de verão, dicas de cuidados"
                      value={contentForm.topic}
                      onChange={(e) => setContentForm({...contentForm, topic: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tom da Mensagem
                    </label>
                    <select
                      value={contentForm.tone}
                      onChange={(e) => setContentForm({...contentForm, tone: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm"
                    >
                      <option value="amigável">Amigável</option>
                      <option value="profissional">Profissional</option>
                      <option value="divertido">Divertido</option>
                      <option value="inspirador">Inspirador</option>
                      <option value="promocional">Promocional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Público-alvo
                    </label>
                    <Input
                      placeholder="Ex: Mulheres 25-45 anos"
                      value={contentForm.targetAudience}
                      onChange={(e) => setContentForm({...contentForm, targetAudience: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Call to Action
                    </label>
                    <Input
                      placeholder="Ex: Agende já, Visite nossa loja"
                      value={contentForm.callToAction}
                      onChange={(e) => setContentForm({...contentForm, callToAction: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateContent}
                  disabled={contentLoading || !contentForm.businessInfo}
                  className="w-full sm:w-auto"
                >
                  {contentLoading ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Conteúdo
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <div className="mt-6 bg-white p-6 rounded-lg border">
                    <h3 className="font-semibold mb-4">Conteúdo Gerado:</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 mb-2">Texto Principal:</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{generatedContent.content.mainText}</p>
                        </div>
                      </div>

                      {generatedContent.content.hashtags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Hashtags:</h4>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p>{generatedContent.content.hashtags.join(' ')}</p>
                          </div>
                        </div>
                      )}

                      {generatedContent.content.callToAction && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Call to Action:</h4>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p>{generatedContent.content.callToAction}</p>
                          </div>
                        </div>
                      )}

                      {generatedContent.content.bestTimeToPost && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Melhor Horário:</h4>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p>{generatedContent.content.bestTimeToPost}</p>
                          </div>
                        </div>
                      )}

                      {generatedContent.suggestions && generatedContent.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Sugestões:</h4>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <ul className="list-disc list-inside space-y-1">
                              {generatedContent.suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="text-sm">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
                  Lembretes e Mensagens WhatsApp
                </CardTitle>
                <CardDescription>
                  Envie lembretes automáticos e confirmações via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de Mensagem
                    </label>
                    <select
                      value={whatsappForm.type}
                      onChange={(e) => setWhatsappForm({...whatsappForm, type: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm"
                    >
                      <option value="reminder">Lembrete de Agendamento</option>
                      <option value="confirmation">Confirmação de Agendamento</option>
                      <option value="auto_response">Resposta Automática</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Número do WhatsApp
                    </label>
                    <Input
                      placeholder="+5511999999999"
                      value={whatsappForm.phoneNumber}
                      onChange={(e) => setWhatsappForm({...whatsappForm, phoneNumber: e.target.value})}
                    />
                  </div>

                  {(whatsappForm.type === 'reminder' || whatsappForm.type === 'confirmation') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Data e Hora do Agendamento
                        </label>
                        <Input
                          type="datetime-local"
                          value={whatsappForm.appointmentTime}
                          onChange={(e) => setWhatsappForm({...whatsappForm, appointmentTime: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome do Serviço
                        </label>
                        <Input
                          placeholder="Ex: Corte de cabelo, Consulta"
                          value={whatsappForm.serviceName}
                          onChange={(e) => setWhatsappForm({...whatsappForm, serviceName: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={sendWhatsApp}
                  disabled={whatsappLoading || !whatsappForm.phoneNumber}
                  className="w-full sm:w-auto"
                >
                  {whatsappLoading ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar WhatsApp
                    </>
                  )}
                </Button>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Dicas para WhatsApp:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use o formato internacional: +55 + DDD + número</li>
                    <li>• Lembretes são enviados automaticamente 1 hora antes</li>
                    <li>• Todas as mensagens são personalizadas com IA</li>
                    <li>• O sistema detecta respostas e pode escalar para humanos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}