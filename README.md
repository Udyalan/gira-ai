# 🌸 Malíbi Store - E-commerce de Lingerie Feminina

Uma loja virtual moderna e elegante desenvolvida com Next.js, especializada em lingerie feminina. O projeto foi inspirado no design sofisticado da Hope Lingerie e construído com as melhores práticas de desenvolvimento web.

## ✨ Características

- **Design Moderno**: Interface elegante com cores suaves (rosé, branco, dourado)
- **Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop
- **Sistema Completo**: Catálogo, carrinho, checkout e painel administrativo
- **Autenticação**: Sistema de login/cadastro com NextAuth.js
- **Busca Inteligente**: Busca com debounce e filtros avançados
- **Pagamentos**: Integração com Stripe para pagamentos seguros
- **Email**: Confirmações automáticas via Resend

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (ícones)
- **Headless UI** (componentes acessíveis)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **Supabase** (PostgreSQL)
- **NextAuth.js** (autenticação)
- **bcryptjs** (hash de senhas)

### Pagamentos & Email
- **Stripe** (pagamentos)
- **Resend** (email)

## 🚀 Configuração e Instalação

### 1. Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Stripe (modo test)
- Conta no Resend (opcional)

### 2. Clone o repositório

\`\`\`bash
git clone <seu-repo>
cd malibi-store
\`\`\`

### 3. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 4. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com/)
2. Vá em Settings > Database
3. Copie a connection string PostgreSQL

### 5. Configure as variáveis de ambiente

Copie o arquivo \`.env.example\` para \`.env\`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-change-in-production"

# Stripe (use test keys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Email service)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"

# Admin credentials
ADMIN_EMAIL="admin@malibi.com"
ADMIN_PASSWORD="admin123"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 6. Configure o banco de dados

Execute as migrações do Prisma:

\`\`\`bash
npm run db:push
\`\`\`

Popule o banco com dados iniciais:

\`\`\`bash
npm run db:seed
\`\`\`

### 7. Execute o projeto

\`\`\`bash
npm run dev
\`\`\`

O site estará disponível em \`http://localhost:3000\`

## 📱 Funcionalidades

### Para Clientes
- ✅ Navegação por categorias (Conjuntos, Calcinhas, Sutiãs, Bodies, Acessórios)
- ✅ Busca com filtros por preço, categoria e disponibilidade
- ✅ Página de produto com galeria de imagens
- ✅ Seleção de variações (tamanho e cor)
- ✅ Carrinho de compras persistente
- ✅ Sistema de checkout completo
- ✅ Pagamento via Stripe (Pix e cartão)
- ✅ Histórico de pedidos
- ✅ Sistema de favoritos

### Para Administradores
- ✅ Painel administrativo completo
- ✅ CRUD de produtos e categorias
- ✅ Gerenciamento de variações e estoque
- ✅ Upload de imagens
- ✅ Visualização de pedidos
- ✅ Relatórios de vendas

## 🎨 Design System

### Paleta de Cores
- **Rose**: Tons de rosa para elementos principais
- **Gold**: Detalhes dourados para acentos
- **Neutral**: Tons de cinza para textos e fundos

### Tipografia
- **Font**: Inter (clean e moderna)
- **Hierarquia**: Títulos em bold, corpo em regular

## 🗂️ Estrutura do Projeto

\`\`\`
malibi-store/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts           # Dados iniciais
├── src/
│   ├── app/              # App Router (Next.js 14)
│   │   ├── api/         # API Routes
│   │   ├── auth/        # Páginas de autenticação
│   │   ├── produto/     # Página de produto
│   │   ├── produtos/    # Lista de produtos
│   │   └── layout.tsx   # Layout principal
│   ├── components/      # Componentes reutilizáveis
│   ├── lib/            # Utilities e configurações
│   └── types/          # Tipos TypeScript
├── public/             # Arquivos estáticos
└── tailwind.config.ts  # Configuração do Tailwind
\`\`\`

## 🚀 Deploy na Vercel

### 1. Configuração no Vercel

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático será realizado

### 2. Configurações de Produção

No arquivo \`.env\` de produção:

\`\`\`env
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXT_PUBLIC_APP_URL="https://seu-dominio.vercel.app"
\`\`\`

### 3. Domínio Personalizado

Configure o domínio \`malibi.vercel.app\` nas configurações do projeto.

## 📊 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build e produção
npm run build           # Build para produção
npm run start           # Inicia servidor de produção

# Banco de dados
npm run db:generate     # Gera cliente Prisma
npm run db:push         # Aplica schema ao banco
npm run db:migrate      # Cria nova migração
npm run db:seed         # Popula banco com dados iniciais
npm run db:studio       # Interface visual do banco
npm run db:reset        # Reseta banco (cuidado!)

# Qualidade de código
npm run lint            # Executa ESLint
\`\`\`

## 👥 Contas de Demonstração

### Administrador
- **Email**: admin@malibi.com
- **Senha**: admin123

### Cliente
- **Email**: cliente@malibi.com  
- **Senha**: cliente123

## 🔒 Segurança

- Senhas hasheadas com bcryptjs
- Autenticação JWT via NextAuth.js
- Validação de dados em todas as APIs
- Proteção CSRF automática
- Sanitização de inputs

## 🧪 Testes

Para executar testes (quando implementados):

\`\`\`bash
npm run test           # Executa testes
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Cobertura de testes
\`\`\`

## 📈 Performance

- Server-side rendering (SSR)
- Otimização de imagens automática
- Code splitting por rota
- Lazy loading de componentes
- Caching estratégico

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo \`LICENSE\` para detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Email: contato@malibi.com
- WhatsApp: (11) 99999-9999

---

💖 Desenvolvido com amor para a Malíbi