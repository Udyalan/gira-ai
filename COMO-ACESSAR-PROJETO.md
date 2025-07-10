# 🚀 Como Acessar o Projeto Gira AI

## 📍 **Situação Atual**

✅ **Projeto Recuperado:** O projeto `gira.ai` foi recuperado com sucesso do GitHub  
✅ **Dependências Instaladas:** Todas as dependências npm foram instaladas  
✅ **Ambiente Configurado:** Node.js 22.16.0 e npm 10.9.2 disponíveis  

## 🌐 **Acessando o Projeto no Cursor Web**

### **Opção 1: Executar no Ambiente Remoto (Recomendado)**

```bash
# 1. Navegar para o projeto
cd /workspace/gira-ai

# 2. Criar arquivo de variáveis de ambiente
cp .env.local.example .env.local  # (se existir)
# OU criar manualmente:
nano .env.local

# 3. Executar o projeto
npm run dev
```

### **Opção 2: Port Forwarding do Desktop**

Se você tem o projeto rodando no seu desktop local:

1. **No seu desktop:**
   ```bash
   # Execute o projeto (se ainda não estiver rodando)
   npm run dev
   ```

2. **Configure o port forwarding:**
   - **VS Code/Cursor:** Use a aba "Ports" para expor a porta 3000
   - **Terminal:** `ssh -L 3000:localhost:3000 user@remote-server`

## ⚙️ **Configuração de Variáveis de Ambiente**

### **Variáveis Necessárias (.env.local):**

```env
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# OpenAI (IA)
OPENAI_API_KEY=sk-sua-chave-openai

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=seu-sid
TWILIO_AUTH_TOKEN=seu-token
TWILIO_PHONE_NUMBER=+5511999999999

# Stripe (Pagamentos - Opcional)
STRIPE_SECRET_KEY=sk_test_sua-chave
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave

# App
NEXTAUTH_SECRET=sua-chave-secreta
APP_URL=http://localhost:3000
```

### **Como Obter as Chaves:**

#### 🗄️ **Supabase (Grátis)**
1. Acesse: https://supabase.com
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a URL e a chave anônima

#### 🤖 **OpenAI (Pago)**
1. Acesse: https://platform.openai.com
2. Crie uma API Key em "API Keys"
3. Adicione créditos na conta

#### 📱 **Twilio (WhatsApp)**
1. Acesse: https://twilio.com
2. Crie uma conta
3. Configure o WhatsApp Business API
4. Obtenha SID, Token e número

## 🚀 **Executando o Projeto**

### **No Ambiente Remoto (Cursor Web):**

```bash
# Entrar no diretório
cd /workspace/gira-ai

# Verificar se as dependências estão instaladas
npm list --depth=0

# Executar em desenvolvimento
npm run dev

# O projeto ficará disponível em:
# http://localhost:3000 (local)
# https://sua-url-cursor.com:3000 (remoto)
```

### **No Desktop Local:**

```bash
# Clone ou navegue para o projeto
git clone https://github.com/Udyalan/gira-ai.git
cd gira-ai

# Instale dependências
npm install

# Configure .env.local
# Execute
npm run dev
```

## 🔧 **Troubleshooting**

### **Projeto não inicia?**
```bash
# Verificar erros
npm run dev 2>&1 | head -20

# Limpar cache
rm -rf .next
rm -rf node_modules package-lock.json
npm install

# Verificar porta
lsof -i :3000  # (se disponível)
```

### **Erro de variáveis de ambiente?**
- ✅ Verifique se `.env.local` existe
- ✅ Confirme se todas as chaves estão corretas
- ✅ Reinicie o servidor após alterar .env

### **Não consegue acessar remotamente?**
1. **Port Forwarding:** Configure o Cursor/VS Code
2. **Firewall:** Libere a porta 3000
3. **Host Binding:** Modifique `next.config.ts`:
   ```ts
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       serverComponentsExternalPackages: ['@prisma/client']
     },
     // Adicione para acesso remoto:
     server: {
       host: '0.0.0.0',
       port: 3000
     }
   }
   ```

## 📋 **Checklist Rápido**

- [ ] ✅ Projeto recuperado
- [ ] ✅ Dependências instaladas  
- [ ] ⚠️ Arquivo .env.local configurado
- [ ] ⚠️ Chaves de API obtidas
- [ ] ⚠️ Servidor executando
- [ ] ⚠️ Acesso remoto configurado

## 🎯 **Próximos Passos**

1. **Configure as variáveis de ambiente** (.env.local)
2. **Execute:** `npm run dev`
3. **Acesse:** http://localhost:3000
4. **Teste as funcionalidades:**
   - 📊 Upload de planilha CSV
   - 🎨 Geração de conteúdo
   - 📱 WhatsApp (se configurado)

## 📞 **Precisa de Ajuda?**

Se ainda não conseguir acessar:
1. Compartilhe os erros que aparecem no terminal
2. Confirme se está executando no ambiente correto
3. Verifique se as portas estão liberadas

---
**Status:** ⚠️ Projeto pronto, aguardando configuração de ambiente  
**Acesso:** Configurar .env.local → npm run dev → localhost:3000