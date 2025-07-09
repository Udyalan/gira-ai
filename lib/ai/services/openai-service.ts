import OpenAI from 'openai';
import { aiConfig, featureFlags } from '@/lib/config/feature-flags';
import { aiMemoryOperations, userOperations, User } from '@/lib/ai/supabase-client';

declare const process: {
  env: Record<string, string | undefined>;
  NODE_ENV?: string;
};

// Interfaces para o sistema de IA
export interface AIContext {
  userId?: string;
  userProfile?: User;
  conversationHistory?: Message[];
  currentModule: string;
  businessContext?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  data?: Record<string, any>;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!featureFlags.AI_ENABLED) {
      console.log('🤖 IA desabilitada via feature flag');
      return;
    }

    if (!aiConfig.openai.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY não configurado');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: aiConfig.openai.apiKey,
      });
      this.isInitialized = true;
      
      if (process?.env?.NODE_ENV === 'development') {
        console.log('🤖 OpenAI Service inicializado');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar OpenAI:', error);
    }
  }

  async generateResponse(
    prompt: string, 
    context: AIContext = { currentModule: 'general' }
  ): Promise<AIResponse> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI não está configurado ou habilitado');
    }

    try {
      // Construir contexto enriquecido
      const enrichedPrompt = await this.buildContextualPrompt(prompt, context);
      const systemPrompt = this.getSystemPrompt(context.currentModule, context.userProfile);

      // Chamar OpenAI
      const response = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enrichedPrompt }
        ],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Salvar interação na memória (se usuário estiver logado)
      if (context.userId && featureFlags.SUPABASE_ENABLED) {
        await this.storeInteraction(context.userId, {
          input: prompt,
          output: content,
          context: context,
          module: context.currentModule
        });
      }

      return {
        content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        metadata: {
          model: aiConfig.openai.model,
          module: context.currentModule,
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('❌ Erro na chamada OpenAI:', error);
      throw new Error(`Erro ao processar solicitação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async analyzeData(data: any, analysisType: string, context?: AIContext): Promise<AIAnalysis> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI não está configurado');
    }

    const prompt = this.buildAnalysisPrompt(data, analysisType);
    const response = await this.generateResponse(prompt, {
      ...context,
      currentModule: `analysis_${analysisType}`
    });

    // Tentar extrair estrutura da resposta
    try {
      const analysis = JSON.parse(response.content);
      return {
        summary: analysis.summary || response.content,
        insights: analysis.insights || [],
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || 0.8,
        data: analysis.data || {}
      };
    } catch {
      // Se não conseguir parsear JSON, retornar formato básico
      return {
        summary: response.content,
        insights: [],
        recommendations: [],
        confidence: 0.7
      };
    }
  }

  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    if (!this.isInitialized || !this.client) {
      return { connected: false, error: 'OpenAI não configurado' };
    }

    try {
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });
      return { connected: true };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  }

  // Métodos privados
  private async buildContextualPrompt(prompt: string, context: AIContext): Promise<string> {
    let enrichedPrompt = prompt;

    // Adicionar contexto do usuário
    if (context.userProfile) {
      enrichedPrompt = `
Contexto do usuário:
- Nome: ${context.userProfile.name || 'Não informado'}
- Empresa: ${context.userProfile.company_id || 'Não informado'}
- Role: ${context.userProfile.role}

${enrichedPrompt}`;
    }

    // Adicionar histórico recente (se disponível)
    if (context.userId && featureFlags.SUPABASE_ENABLED) {
      const recentMemories = await aiMemoryOperations.getByUser(context.userId, 'conversation');
      if (recentMemories.length > 0) {
        const recentContext = recentMemories
          .slice(0, 3) // Últimas 3 interações
          .map(m => `- ${m.content.input}: ${m.content.output}`)
          .join('\n');
        
        enrichedPrompt = `
Contexto de conversas recentes:
${recentContext}

Solicitação atual:
${enrichedPrompt}`;
      }
    }

    return enrichedPrompt;
  }

  private getSystemPrompt(module: string, userProfile?: User): string {
    const basePrompt = `
Você é o assistente de IA do Gira.ai, uma plataforma completa de gestão empresarial.
Você é especializado em fornecer insights inteligentes e soluções práticas para empresas.

Características importantes:
- Seja sempre útil, preciso e profissional
- Forneça respostas claras e acionáveis
- Use dados quando disponível para embasar recomendações
- Adapte sua linguagem ao perfil do usuário
- Foque em soluções práticas para negócios
`;

    const modulePrompts = {
      general: 'Você está auxiliando com questões gerais de gestão empresarial.',
      financial: 'Você está no módulo financeiro. Foque em análise financeira, fluxo de caixa, e recomendações econômicas.',
      marketing: 'Você está no módulo de marketing. Ajude com estratégias de marketing, criação de conteúdo e análise de engajamento.',
      whatsapp: 'Você está no módulo WhatsApp. Auxilie com automação de atendimento e comunicação com clientes.',
      scheduling: 'Você está no módulo de agendamentos. Ajude com otimização de agenda e gestão de tempo.',
      analytics: 'Você está no módulo de analytics. Foque em análise de dados e geração de insights.',
      crm: 'Você está no módulo CRM. Auxilie com gestão de relacionamento com clientes.',
    };

    const modulePrompt = modulePrompts[module as keyof typeof modulePrompts] || modulePrompts.general;

    let roleContext = '';
    if (userProfile?.role) {
      const rolePrompts = {
        admin: 'O usuário é um administrador do sistema. Forneça insights estratégicos e visão macro.',
        company_admin: 'O usuário é um administrador da empresa. Foque em gestão operacional e tomada de decisão.',
        manager: 'O usuário é um gerente. Auxilie com gestão de equipe e processos.',
        user: 'O usuário é um colaborador. Forneça orientações práticas para suas tarefas.'
      };
      roleContext = rolePrompts[userProfile.role] || '';
    }

    return `${basePrompt}\n\n${modulePrompt}\n\n${roleContext}`.trim();
  }

  private buildAnalysisPrompt(data: any, analysisType: string): string {
    const basePrompt = `
Analise os seguintes dados e forneça insights acionáveis.
Retorne a resposta em formato JSON com as seguintes chaves:
- summary: resumo executivo da análise
- insights: array de insights principais encontrados
- recommendations: array de recomendações práticas
- confidence: número entre 0 e 1 indicando confiança na análise
- data: dados processados ou métricas relevantes

Tipo de análise: ${analysisType}
Dados para análise:
${JSON.stringify(data, null, 2)}
`;

    return basePrompt;
  }

  private async storeInteraction(
    userId: string, 
    interaction: {
      input: string;
      output: string;
      context: AIContext;
      module: string;
    }
  ): Promise<void> {
    try {
      await aiMemoryOperations.store({
        user_id: userId,
        context_type: 'conversation',
        content: {
          input: interaction.input,
          output: interaction.output,
          module: interaction.module,
          timestamp: new Date().toISOString()
        },
        relevance_score: 1.0,
      });
    } catch (error) {
      console.error('❌ Erro ao salvar interação:', error);
    }
  }
}

// Instância singleton do serviço
export const openaiService = new OpenAIService();

// Função utilitária para verificar se a IA está disponível
export function isAIAvailable(): boolean {
  return featureFlags.AI_ENABLED && aiConfig.openai.apiKey !== undefined;
}

// Tipos já exportados acima nas declarações das interfaces