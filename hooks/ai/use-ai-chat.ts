'use client';

import { useState, useCallback } from 'react';
import { openaiService, isAIAvailable, AIContext, Message, AIResponse } from '@/lib/ai/services/openai-service';
import { featureFlags } from '@/lib/config/feature-flags';

interface UseAIChatOptions {
  userId?: string;
  module?: string;
  context?: Partial<AIContext>;
  maxMessages?: number;
  autoStore?: boolean;
}

interface UseAIChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isEnabled: boolean;
  sendMessage: (message: string) => Promise<string | null>;
  clearMessages: () => void;
  analyzeData: (data: any, analysisType: string) => Promise<any>;
  retryLastMessage: () => Promise<string | null>;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    userId,
    module = 'general',
    context = {},
    maxMessages = 50,
    autoStore = true
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');

  const isEnabled = isAIAvailable();

  const sendMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!isEnabled) {
      setError('IA não está habilitada. Configure ENABLE_AI=true e OPENAI_API_KEY');
      return null;
    }

    if (!message.trim()) {
      setError('Mensagem não pode estar vazia');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setLastMessage(message);

    try {
      // Adicionar mensagem do usuário
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev.slice(-maxMessages + 1), userMessage]);

      // Preparar contexto para a IA
      const aiContext: AIContext = {
        userId,
        currentModule: module,
        conversationHistory: messages.slice(-10), // Últimas 10 mensagens para contexto
        ...context,
      };

      // Chamar OpenAI
      const response: AIResponse = await openaiService.generateResponse(message, aiContext);

      // Adicionar resposta da IA
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);

      return response.content;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro no chat IA:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, userId, module, maxMessages, context, messages]);

  const retryLastMessage = useCallback(async (): Promise<string | null> => {
    if (!lastMessage) {
      setError('Nenhuma mensagem para repetir');
      return null;
    }
    return sendMessage(lastMessage);
  }, [lastMessage, sendMessage]);

  const analyzeData = useCallback(async (data: any, analysisType: string) => {
    if (!isEnabled) {
      throw new Error('IA não está habilitada');
    }

    setIsLoading(true);
    setError(null);

    try {
      const aiContext: AIContext = {
        userId,
        currentModule: `analysis_${module}`,
        ...context,
      };

      const analysis = await openaiService.analyzeData(data, analysisType, aiContext);
      
      // Opcionalmente adicionar análise ao histórico de mensagens
      if (autoStore) {
        const analysisMessage: Message = {
          role: 'assistant',
          content: `Análise de ${analysisType}: ${analysis.summary}`,
          timestamp: new Date(),
          metadata: { type: 'analysis', analysisType, confidence: analysis.confidence },
        };
        setMessages(prev => [...prev.slice(-maxMessages + 1), analysisMessage]);
      }

      return analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, userId, module, context, autoStore, maxMessages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastMessage('');
  }, []);

  return {
    messages,
    isLoading,
    error,
    isEnabled,
    sendMessage,
    clearMessages,
    analyzeData,
    retryLastMessage,
  };
}

// Hook específico para análise de dados
export function useAIAnalysis(module: string = 'analytics') {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = useCallback(async (data: any, analysisType: string) => {
    if (!isAIAvailable()) {
      throw new Error('IA não está habilitada');
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await openaiService.analyzeData(data, analysisType, {
        currentModule: module,
      });

      setAnalysisResults(prev => [...prev, {
        id: Date.now(),
        type: analysisType,
        data,
        analysis,
        timestamp: new Date(),
      }]);

      return analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [module]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResults([]);
    setError(null);
  }, []);

  return {
    analyzeData,
    isAnalyzing,
    analysisResults,
    error,
    clearAnalysis,
    isEnabled: isAIAvailable(),
  };
}

// Hook para verificar status da IA
export function useAIStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{
    available: boolean;
    openaiConnected: boolean;
    supabaseConnected: boolean;
    errors: string[];
  }>({
    available: false,
    openaiConnected: false,
    supabaseConnected: false,
    errors: [],
  });

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    const errors: string[] = [];

    try {
      // Verificar OpenAI
      const openaiTest = await openaiService.testConnection();
      
      // Verificar Supabase (se habilitado)
      let supabaseConnected = false;
      if (featureFlags.SUPABASE_ENABLED) {
        try {
          const { testSupabaseConnection } = await import('@/lib/ai/supabase-client');
          const supabaseTest = await testSupabaseConnection();
          supabaseConnected = supabaseTest.connected;
          if (!supabaseConnected && supabaseTest.error) {
            errors.push(`Supabase: ${supabaseTest.error}`);
          }
        } catch (err) {
          errors.push('Erro ao verificar Supabase');
        }
      } else {
        supabaseConnected = true; // Considerado OK se não habilitado
      }

      if (!openaiTest.connected && openaiTest.error) {
        errors.push(`OpenAI: ${openaiTest.error}`);
      }

      setStatus({
        available: isAIAvailable(),
        openaiConnected: openaiTest.connected,
        supabaseConnected,
        errors,
      });

    } catch (err) {
      errors.push('Erro geral na verificação');
      setStatus({
        available: false,
        openaiConnected: false,
        supabaseConnected: false,
        errors,
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    status,
    isChecking,
    checkStatus,
    refresh: checkStatus,
  };
}