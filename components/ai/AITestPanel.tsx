'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Interfaces locais para evitar erros de import
interface UseAIChatReturn {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  }>;
  isLoading: boolean;
  error: string | null;
  isEnabled: boolean;
  sendMessage: (message: string) => Promise<string | null>;
  clearMessages: () => void;
}

interface UseAIStatusReturn {
  status: {
    available: boolean;
    openaiConnected: boolean;
    supabaseConnected: boolean;
    errors: string[];
  };
  isChecking: boolean;
  checkStatus: () => Promise<void>;
}

// Mock hooks para quando as dependências não estiverem disponíveis
function useMockAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<UseAIChatReturn['messages']>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'IA não configurada. Configure ENABLE_AI=true e adicione OPENAI_API_KEY para ativar a funcionalidade.' 
      }]);
      setIsLoading(false);
    }, 1000);
    
    return null;
  };

  return {
    messages,
    isLoading,
    error: null,
    isEnabled: false,
    sendMessage,
    clearMessages: () => setMessages([]),
  };
}

function useMockAIStatus(): UseAIStatusReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState({
    available: false,
    openaiConnected: false,
    supabaseConnected: false,
    errors: ['IA não configurada'],
  });

  const checkStatus = async () => {
    setIsChecking(true);
    setTimeout(() => {
      setStatus({
        available: false,
        openaiConnected: false,
        supabaseConnected: false,
        errors: ['Configure ENABLE_AI=true e OPENAI_API_KEY'],
      });
      setIsChecking(false);
    }, 1000);
  };

  return { status, isChecking, checkStatus };
}

// Função para carregar hooks dinamicamente
function useAIChat(): UseAIChatReturn {
  try {
    // Tentar importar o hook real
    const hooks = require('@/hooks/ai/use-ai-chat');
    return hooks.useAIChat({ module: 'dashboard' });
  } catch {
    // Fallback para mock se hooks não disponíveis
    return useMockAIChat();
  }
}

function useAIStatus(): UseAIStatusReturn {
  try {
    const hooks = require('@/hooks/ai/use-ai-chat');
    return hooks.useAIStatus();
  } catch {
    return useMockAIStatus();
  }
}

export function AITestPanel() {
  const [input, setInput] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  
  const { messages, isLoading, error, isEnabled, sendMessage, clearMessages } = useAIChat();
  const { status, isChecking, checkStatus } = useAIStatus();

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColor = status.available ? 'green' : 'red';
  const statusText = status.available ? 'Ativo' : 'Inativo';

  return (
    <div className="space-y-4">
      {/* Header com Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              🤖 Assistente IA - Gira.ai
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={status.available ? 'default' : 'destructive'}>
                {statusText}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatus(!showStatus)}
                disabled={isChecking}
              >
                {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Status'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Status Detalhado */}
        {showStatus && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {status.openaiConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">OpenAI: {status.openaiConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {status.supabaseConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">Supabase: {status.supabaseConnected ? 'Conectado' : 'Opcional'}</span>
              </div>

              {status.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {status.errors.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat com IA</CardTitle>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearMessages}>
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Inicie uma conversa com a IA!</p>
                <p className="text-sm">Experimente perguntar: "Como posso melhorar minhas vendas?"</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'Você' : '🤖 IA'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">IA está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isEnabled 
                  ? "Digite sua mensagem..." 
                  : "Configure IA para usar (ENABLE_AI=true)"
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Enviar'
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Como posso melhorar minhas vendas?")}
              disabled={isLoading}
            >
              💰 Vendas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Preciso de ideias para marketing digital")}
              disabled={isLoading}
            >
              📱 Marketing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Como organizar melhor meu financeiro?")}
              disabled={isLoading}
            >
              📊 Financeiro
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Quais métricas devo acompanhar?")}
              disabled={isLoading}
            >
              📈 Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Esta é a primeira versão da IA integrada ao Gira.ai. 
            Nas próximas semanas, ela será expandida para todos os módulos com análise 
            automática de dados, geração de relatórios e muito mais!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente simplificado para status apenas
export function AIStatusBadge() {
  const { status, checkStatus } = useAIStatus();

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Badge 
      variant={status.available ? 'default' : 'outline'}
      className="cursor-pointer"
      onClick={checkStatus}
    >
      🤖 IA {status.available ? 'Ativa' : 'Inativa'}
    </Badge>
  );
}