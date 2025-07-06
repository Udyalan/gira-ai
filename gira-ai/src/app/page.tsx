import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, MessageSquare, TrendingUp, Calendar, FileText, Brain } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">gira.ai</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme seu negócio com
            <span className="text-blue-600"> Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            O gira.ai ajuda pequenas empresas a crescer com análise financeira inteligente, 
            atendimento automatizado e criação de conteúdo para redes sociais.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Começar Grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Ver Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>
                IA analisa suas planilhas e gera insights sobre receitas, gastos e tendências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Gráficos automáticos</li>
                <li>• Alertas de gastos</li>
                <li>• Previsões de fluxo</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Atendimento WhatsApp</CardTitle>
              <CardDescription>
                Atenda clientes 24/7 com IA que agenda horários e responde dúvidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Agendamento automático</li>
                <li>• Respostas inteligentes</li>
                <li>• Confirmações de horário</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Criação de Conteúdo</CardTitle>
              <CardDescription>
                Gere posts para redes sociais que atraem mais clientes para seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Posts para Instagram</li>
                <li>• Hashtags relevantes</li>
                <li>• Melhor horário para postar</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Agenda Inteligente</CardTitle>
              <CardDescription>
                Organize horários automaticamente e envie lembretes para clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Sincronização automática</li>
                <li>• Lembretes por WhatsApp</li>
                <li>• Controle de disponibilidade</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Documentos Automáticos</CardTitle>
              <CardDescription>
                Crie orçamentos, recibos e propostas com apenas alguns cliques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Templates personalizados</li>
                <li>• Cálculos automáticos</li>
                <li>• Envio por email</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Assistente de Preços</CardTitle>
              <CardDescription>
                IA calcula preços ideais considerando custos, concorrência e margem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Análise de custos</li>
                <li>• Margem de lucro ideal</li>
                <li>• Comparação com mercado</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Junte-se a centenas de empresários que já usam IA para crescer mais rápido
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Começar Agora - É Grátis</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">gira.ai</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 gira.ai. Transformando pequenos negócios com IA.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
