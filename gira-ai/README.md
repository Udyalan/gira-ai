# 🧠 gira.ai - IA para Pequenas Empresas

**Transforme seu negócio com Inteligência Artificial**

O gira.ai é uma plataforma completa que ajuda pequenas empresas a crescer usando IA para análise financeira, criação de conteúdo e atendimento automatizado.

## 🚀 Funcionalidades Principais

### 📊 **Análise Financeira Inteligente**
- Upload de planilhas CSV/Excel
- Análise automática com IA (GPT-4)
- Cálculo de métricas: receitas, despesas, lucro, margem
- Insights e recomendações personalizadas
- Alertas automáticos de situações importantes

### 🎨 **Gerador de Conteúdo para Redes Sociais**
- Posts personalizados para Instagram, Facebook, LinkedIn, Twitter
- IA cria texto, hashtags e call-to-action
- Diferentes tons: amigável, profissional, divertido, inspirador
- Sugestões de melhor horário para postar
- Dicas de engajamento por plataforma

### 📱 **WhatsApp Automático**
- Lembretes de agendamento via Twilio
- Confirmações automáticas
- Respostas inteligentes 24/7
- Agendamento programado de mensagens
- Sistema de logs completo

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **IA:** OpenAI GPT-4
- **WhatsApp:** Twilio API
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **UI:** Lucide React, Radix UI

## 🚀 Deploy Rápido

### Vercel (Recomendado)
1. Conecte este repositório à Vercel
2. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
   ```
3. Deploy automático!

## 🔧 Configuração Local

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/gira-ai.git
cd gira-ai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas chaves

# Execute em desenvolvimento
npm run dev
```

## 📋 Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_whatsapp_number

# App
NEXTAUTH_SECRET=your_nextauth_secret
APP_URL=https://your-domain.vercel.app
```

## 🎯 Como Usar

### 1. **Análise Financeira**
- Faça upload de sua planilha CSV
- A IA analisa automaticamente seus dados
- Receba insights e recomendações
- Veja métricas em tempo real

### 2. **Criar Conteúdo**
- Descreva seu negócio
- Escolha a rede social
- Defina tom e público-alvo
- IA gera post completo com hashtags

### 3. **WhatsApp Automático**
- Configure lembretes de agendamento
- Envie confirmações automáticas
- Responda clientes 24/7
- Monitore todas as mensagens

## 🔮 Roadmap Futuro

- [ ] **Sistema SaaS completo** com planos e pagamentos
- [ ] **Dashboard analytics** avançado
- [ ] **Integração com mais redes sociais**
- [ ] **CRM integrado** para gestão de clientes
- [ ] **Relatórios automáticos** em PDF
- [ ] **App mobile nativo**
- [ ] **Marketplace de templates**
- [ ] **Integração com e-commerce**

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 🆘 Suporte

- 📧 Email: contato@gira.ai
- 💬 WhatsApp: +55 11 99999-9999
- 🌐 Site: https://gira.ai

---

**Feito com ❤️ para pequenas empresas brasileiras**
