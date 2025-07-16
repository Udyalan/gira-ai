# 🚀 Guia Rápido de Configuração - Malíbi Store

## ⚡ Setup Rápido (5 minutos)

### 1. Configure o Supabase
```bash
# 1. Vá para https://supabase.com e crie um projeto
# 2. Copie a DATABASE_URL em Settings > Database
# 3. Cole no arquivo .env
```

### 2. Configure as variáveis de ambiente
```bash
# Edite o arquivo .env e configure:
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Execute os comandos
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Popular com dados iniciais
npm run db:seed

# Iniciar servidor
npm run dev
```

### 4. Acesse o site
- **Site**: http://localhost:3000
- **Admin**: admin@malibi.com / admin123
- **Cliente**: cliente@malibi.com / cliente123

## 🔧 Configurações Opcionais

### Stripe (Pagamentos)
```env
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### Resend (Email)
```env
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@seudominio.com"
```

## 📦 Deploy na Vercel

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

## 🆘 Problemas Comuns

### Erro de banco de dados
```bash
# Resete o banco se necessário
npm run db:reset
npm run db:seed
```

### Erro de autenticação
```bash
# Verifique se o NEXTAUTH_SECRET está configurado
# Gere um novo: openssl rand -base64 32
```

### Erro de dependências
```bash
# Delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

---
✨ Pronto! Seu e-commerce de lingerie está funcionando!