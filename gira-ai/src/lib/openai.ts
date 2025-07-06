import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para analisar dados financeiros
export async function analyzeFinancialData(data: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um assistente financeiro inteligente especializado em análise de dados para pequenas empresas. 
          Analise os dados fornecidos e retorne insights claros e práticos em português brasileiro.
          Sempre inclua:
          1. Resumo da situação financeira
          2. Principais tendências
          3. Recomendações específicas
          4. Alertas importantes (se houver)
          
          Mantenha a linguagem simples e didática.`
        },
        {
          role: "user",
          content: `Analise estes dados financeiros: ${JSON.stringify(data)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return completion.choices[0]?.message?.content || 'Não foi possível analisar os dados.'
  } catch (error) {
    console.error('Erro na análise financeira:', error)
    throw new Error('Erro ao analisar dados financeiros')
  }
}

// Função para gerar conteúdo para redes sociais
export async function generateSocialContent(businessInfo: string, contentType: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em marketing digital e criação de conteúdo para redes sociais.
          Crie conteúdo envolvente, autêntico e otimizado para ${contentType}.
          Sempre inclua:
          1. Texto principal atrativo
          2. Hashtags relevantes
          3. Call-to-action apropriado
          4. Sugestão de melhor horário para postar
          
          O conteúdo deve ser em português brasileiro e adequado para pequenas empresas.`
        },
        {
          role: "user",
          content: `Crie um post para ${contentType} sobre: ${businessInfo}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || 'Não foi possível gerar o conteúdo.'
  } catch (error) {
    console.error('Erro na geração de conteúdo:', error)
    throw new Error('Erro ao gerar conteúdo')
  }
}

// Função para responder perguntas sobre o negócio
export async function answerBusinessQuestion(question: string, context: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de negócios inteligente que ajuda proprietários de pequenas empresas.
          Responda perguntas de forma clara e prática, sempre em português brasileiro.
          Use o contexto fornecido para dar respostas precisas e úteis.`
        },
        {
          role: "user",
          content: `Contexto do negócio: ${context}\n\nPergunta: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    return completion.choices[0]?.message?.content || 'Não foi possível responder à pergunta.'
  } catch (error) {
    console.error('Erro ao responder pergunta:', error)
    throw new Error('Erro ao processar pergunta')
  }
}