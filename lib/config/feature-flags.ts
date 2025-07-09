// Configuração de Feature Flags para controle gradual de funcionalidades
declare const process: {
  env: Record<string, string | undefined>;
  NODE_ENV?: string;
};

export const featureFlags = {
  AI_ENABLED: process.env.ENABLE_AI === 'true',
  SUPABASE_ENABLED: process.env.USE_SUPABASE === 'true',
  WHATSAPP_BUSINESS: process.env.WHATSAPP_BUSINESS === 'true',
  UPLOAD_ANALYSIS: process.env.UPLOAD_ANALYSIS === 'true',
  SMART_BILLING: process.env.SMART_BILLING === 'true',
  MARKETING_AI: process.env.MARKETING_AI === 'true',
  FINANCIAL_AI: process.env.FINANCIAL_AI === 'true',
  SCHEDULING_AI: process.env.SCHEDULING_AI === 'true',
  MARKETPLACE: process.env.MARKETPLACE === 'true',
  AFFILIATE_SYSTEM: process.env.AFFILIATE_SYSTEM === 'true',
};

export const aiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: process.env.PINECONE_INDEX_NAME || 'gira-ai-memory',
  },
};

// Função para verificar se as configurações estão válidas
export function validateAIConfig() {
  const errors: string[] = [];

  if (featureFlags.AI_ENABLED && !aiConfig.openai.apiKey) {
    errors.push('OPENAI_API_KEY é obrigatório quando AI_ENABLED=true');
  }

  if (featureFlags.SUPABASE_ENABLED && (!aiConfig.supabase.url || !aiConfig.supabase.anonKey)) {
    errors.push('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios quando USE_SUPABASE=true');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Log da configuração atual (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log('🤖 Gira.ai - Configuração de Features:', {
    aiEnabled: featureFlags.AI_ENABLED,
    supabaseEnabled: featureFlags.SUPABASE_ENABLED,
    configValid: validateAIConfig().valid,
  });
}