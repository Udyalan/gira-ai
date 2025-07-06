import { NextRequest, NextResponse } from 'next/server'
import { generateSocialContent } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { 
      businessInfo, 
      contentType, 
      topic, 
      tone, 
      targetAudience,
      callToAction 
    } = await request.json()

    if (!businessInfo || !contentType) {
      return NextResponse.json({ 
        error: 'Informações do negócio e tipo de conteúdo são obrigatórios' 
      }, { status: 400 })
    }

    // Construir prompt detalhado
    const detailedPrompt = buildContentPrompt({
      businessInfo,
      contentType,
      topic,
      tone,
      targetAudience,
      callToAction
    })

    // Gerar conteúdo com IA
    const generatedContent = await generateSocialContent(detailedPrompt, contentType)

    // Processar resposta da IA
    const processedContent = processAIResponse(generatedContent, contentType)

    // Salvar no histórico
    const { error: saveError } = await supabase
      .from('content_generations')
      .insert({
        user_id: user.id,
        content_type: contentType,
        business_info: businessInfo,
        generated_content: processedContent,
        prompt_data: {
          topic,
          tone,
          targetAudience,
          callToAction
        }
      })

    if (saveError) {
      console.error('Erro ao salvar conteúdo:', saveError)
    }

    return NextResponse.json({
      success: true,
      content: processedContent,
      suggestions: generateContentSuggestions(contentType, businessInfo)
    })

  } catch (error) {
    console.error('Erro na geração de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function buildContentPrompt(data: any) {
  const { businessInfo, contentType, topic, tone, targetAudience, callToAction } = data
  
  let prompt = `Negócio: ${businessInfo}`
  
  if (topic) prompt += `\nTópico: ${topic}`
  if (tone) prompt += `\nTom: ${tone}`
  if (targetAudience) prompt += `\nPúblico-alvo: ${targetAudience}`
  if (callToAction) prompt += `\nCall to action desejado: ${callToAction}`

  // Adicionar instruções específicas por tipo
  switch (contentType.toLowerCase()) {
    case 'instagram':
      prompt += `\n\nCrie um post para Instagram que seja visual e envolvente, com hashtags relevantes e emojis apropriados.`
      break
    case 'facebook':
      prompt += `\n\nCrie um post para Facebook que gere engajamento e compartilhamentos, com uma linguagem mais conversacional.`
      break
    case 'linkedin':
      prompt += `\n\nCrie um post para LinkedIn com tom profissional, focado em networking e valor para o mercado.`
      break
    case 'twitter':
      prompt += `\n\nCrie um tweet conciso e impactante, respeitando o limite de caracteres.`
      break
    default:
      prompt += `\n\nCrie um post para redes sociais que seja atrativo e engajante.`
  }

  return prompt
}

function processAIResponse(aiResponse: string, contentType: string) {
  // Extrair diferentes seções da resposta
  const sections = aiResponse.split('\n').filter(line => line.trim())
  
  const result = {
    mainText: '',
    hashtags: [] as string[],
    callToAction: '',
    bestTimeToPost: '',
    additionalTips: [] as string[]
  }

  let currentSection = 'mainText'
  
  for (const line of sections) {
    if (line.toLowerCase().includes('hashtag')) {
      currentSection = 'hashtags'
      // Extrair hashtags da linha
      const hashtags = line.match(/#\w+/g) || []
      result.hashtags.push(...hashtags)
    } else if (line.toLowerCase().includes('call') || line.toLowerCase().includes('ação')) {
      currentSection = 'callToAction'
      result.callToAction = line.replace(/.*?:/, '').trim()
    } else if (line.toLowerCase().includes('melhor hora') || line.toLowerCase().includes('horário')) {
      result.bestTimeToPost = line.replace(/.*?:/, '').trim()
    } else if (line.toLowerCase().includes('dica') || line.toLowerCase().includes('sugestão')) {
      result.additionalTips.push(line.replace(/.*?:/, '').trim())
    } else if (currentSection === 'mainText' && !line.startsWith('#')) {
      result.mainText += (result.mainText ? '\n' : '') + line
    }
  }

  // Se não conseguiu extrair hashtags, gerar algumas baseadas no tipo
  if (result.hashtags.length === 0) {
    result.hashtags = generateDefaultHashtags(contentType)
  }

  return result
}

function generateDefaultHashtags(contentType: string): string[] {
  const common = ['#pequenaempresa', '#empreendedorismo', '#negocio']
  
  switch (contentType.toLowerCase()) {
    case 'instagram':
      return [...common, '#insta', '#instagram', '#marketing']
    case 'facebook':
      return [...common, '#facebook', '#rede social']
    case 'linkedin':
      return [...common, '#linkedin', '#networking', '#profissional']
    default:
      return common
  }
}

function generateContentSuggestions(contentType: string, businessInfo: string) {
  const suggestions = []

  // Sugestões baseadas no tipo de conteúdo
  switch (contentType.toLowerCase()) {
    case 'instagram':
      suggestions.push(
        'Use stories para mostrar o dia a dia do negócio',
        'Faça carrosséis com dicas do seu setor',
        'Poste no horário de maior engajamento (18h-21h)'
      )
      break
    case 'facebook':
      suggestions.push(
        'Crie eventos para promoções especiais',
        'Use vídeos ao vivo para interagir com clientes',
        'Responda todos os comentários rapidamente'
      )
      break
    case 'linkedin':
      suggestions.push(
        'Compartilhe insights do seu setor',
        'Publique artigos sobre sua expertise',
        'Participe de grupos relevantes'
      )
      break
    default:
      suggestions.push(
        'Mantenha consistência na postagem',
        'Monitore métricas de engajamento',
        'Interaja com seu público'
      )
  }

  return suggestions
}