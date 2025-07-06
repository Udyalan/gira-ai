import { NextRequest, NextResponse } from 'next/server'
import { analyzeFinancialData } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data, businessContext } = await request.json()

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Dados financeiros inválidos' }, { status: 400 })
    }

    // Preparar contexto para análise
    const context = {
      businessInfo: businessContext || 'Pequena empresa',
      records: data,
      totalRecords: data.length,
      dateRange: {
        start: data[0]?.data || 'N/A',
        end: data[data.length - 1]?.data || 'N/A'
      }
    }

    // Calcular métricas básicas
    const metrics = calculateBasicMetrics(data)
    
    // Analisar com IA
    const aiAnalysis = await analyzeFinancialData({
      ...context,
      metrics
    })

    // Salvar análise no banco
    const { error: saveError } = await supabase
      .from('financial_analyses')
      .insert({
        user_id: user.id,
        analysis: aiAnalysis,
        metrics,
        data_summary: {
          total_records: data.length,
          date_range: context.dateRange
        }
      })

    if (saveError) {
      console.error('Erro ao salvar análise:', saveError)
    }

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      metrics,
      insights: generateInsights(metrics)
    })

  } catch (error) {
    console.error('Erro na análise financeira:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function calculateBasicMetrics(data: any[]) {
  const receitas = data.filter(item => 
    item.tipo?.toLowerCase().includes('receita') || 
    item.categoria?.toLowerCase().includes('receita') ||
    parseFloat(item.valor || 0) > 0
  )
  
  const despesas = data.filter(item => 
    item.tipo?.toLowerCase().includes('despesa') || 
    item.categoria?.toLowerCase().includes('despesa') ||
    parseFloat(item.valor || 0) < 0
  )

  const totalReceitas = receitas.reduce((sum, item) => 
    sum + Math.abs(parseFloat(item.valor || 0)), 0
  )
  
  const totalDespesas = despesas.reduce((sum, item) => 
    sum + Math.abs(parseFloat(item.valor || 0)), 0
  )

  const lucroLiquido = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0

  return {
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro: Math.round(margemLucro * 100) / 100,
    numeroTransacoes: data.length,
    ticketMedio: receitas.length > 0 ? totalReceitas / receitas.length : 0
  }
}

function generateInsights(metrics: any) {
  const insights = []

  if (metrics.lucroLiquido < 0) {
    insights.push({
      type: 'warning',
      title: 'Atenção: Prejuízo',
      message: 'Suas despesas estão maiores que as receitas'
    })
  } else if (metrics.margemLucro < 10) {
    insights.push({
      type: 'info',
      title: 'Margem baixa',
      message: 'Considere revisar suas despesas ou aumentar preços'
    })
  } else {
    insights.push({
      type: 'success',
      title: 'Situação positiva',
      message: 'Sua margem de lucro está saudável'
    })
  }

  if (metrics.ticketMedio < 50) {
    insights.push({
      type: 'tip',
      title: 'Oportunidade',
      message: 'Considere estratégias para aumentar o ticket médio'
    })
  }

  return insights
}