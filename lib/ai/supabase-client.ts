import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { aiConfig, featureFlags } from '@/lib/config/feature-flags';

declare const process: {
  env: Record<string, string | undefined>;
  NODE_ENV?: string;
};

// Tipos para o banco Supabase
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'company_admin' | 'manager' | 'user';
  company_id?: string;
  ai_context?: Record<string, any>;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  subscription_plan: string;
  subscription_expires_at?: string;
  settings?: Record<string, any>;
  api_limits?: Record<string, any>;
  created_at?: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  context_type: 'conversation' | 'preference' | 'learning';
  content: Record<string, any>;
  embedding?: number[];
  relevance_score?: number;
  expires_at?: string;
  created_at?: string;
}

// Cliente Supabase configurado
export const supabaseClient: SupabaseClient | null = 
  featureFlags.SUPABASE_ENABLED && aiConfig.supabase.url && aiConfig.supabase.anonKey
    ? createClient(aiConfig.supabase.url, aiConfig.supabase.anonKey)
    : null;

// Funções de utilidade
export async function testSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!supabaseClient) {
    return { connected: false, error: 'Supabase não configurado' };
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (err) {
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido' 
    };
  }
}

// Operações básicas para usuários
export const userOperations = {
  async getById(id: string): Promise<User | null> {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    return error ? null : data;
  },

  async getByEmail(email: string): Promise<User | null> {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    return error ? null : data;
  },

  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
      .from('users')
      .insert(user)
      .select()
      .single();
      
    return error ? null : data;
  },

  async updateAIContext(userId: string, context: Record<string, any>): Promise<boolean> {
    if (!supabaseClient) return false;
    
    const { error } = await supabaseClient
      .from('users')
      .update({ ai_context: context, updated_at: new Date().toISOString() })
      .eq('id', userId);
      
    return !error;
  }
};

// Operações para memória da IA
export const aiMemoryOperations = {
  async store(memory: Omit<AIMemory, 'id' | 'created_at'>): Promise<AIMemory | null> {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
      .from('ai_memory')
      .insert(memory)
      .select()
      .single();
      
    return error ? null : data;
  },

  async getByUser(userId: string, contextType?: string): Promise<AIMemory[]> {
    if (!supabaseClient) return [];
    
    let query = supabaseClient
      .from('ai_memory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (contextType) {
      query = query.eq('context_type', contextType);
    }
    
    const { data, error } = await query;
    return error ? [] : data;
  },

  async findSimilar(embedding: number[], limit: number = 10): Promise<AIMemory[]> {
    if (!supabaseClient) return [];
    
    // TODO: Implementar busca por similaridade usando pgvector
    // Por enquanto, retornar memórias mais recentes
    const { data, error } = await supabaseClient
      .from('ai_memory')
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(limit);
      
    return error ? [] : data;
  },

  async cleanup(daysOld: number = 30): Promise<boolean> {
    if (!supabaseClient) return false;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const { error } = await supabaseClient
      .from('ai_memory')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .is('expires_at', null);
      
    return !error;
  }
};

// Log de status da conexão
if (featureFlags.SUPABASE_ENABLED && process?.env?.NODE_ENV === 'development') {
  testSupabaseConnection().then(result => {
    console.log('🗄️ Supabase Status:', result);
  });
}