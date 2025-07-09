#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectoryStructure() {
  const directories = [
    'lib/ai/services',
    'lib/ai/memory',
    'lib/ai/prompts',
    'lib/config',
    'lib/migration',
    'components/ai',
    'hooks/ai',
    'scripts/supabase',
    'utils/ai',
  ];

  log('\n📁 Criando estrutura de diretórios...', 'blue');
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`  ✅ Criado: ${dir}`, 'green');
    } else {
      log(`  ⏭️  Já existe: ${dir}`, 'yellow');
    }
  });
}

function installDependencies() {
  log('\n📦 Instalando dependências da IA...', 'blue');
  
  const dependencies = [
    '@supabase/supabase-js',
    'openai',
    '@pinecone-database/pinecone',
    'bull',
    'react-dropzone',
    'chart.js',
    'react-chartjs-2',
    'jspdf',
    'html2canvas',
    'xlsx',
    'papaparse',
  ];

  const devDependencies = [
    '@types/bull',
    '@types/node',
  ];

  try {
    log('  Instalando dependências principais...', 'cyan');
    execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
    
    log('  Instalando dependências de desenvolvimento...', 'cyan');
    execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'inherit' });
    
    log('  ✅ Dependências instaladas com sucesso!', 'green');
  } catch (error) {
    log('  ❌ Erro ao instalar dependências:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

function createEnvFile() {
  log('\n⚙️  Configurando arquivo de ambiente...', 'blue');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envPath)) {
    log('  ⚠️  .env.local já existe. Adicionando configurações da IA...', 'yellow');
    
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    
    if (!existingEnv.includes('ENABLE_AI')) {
      const aiConfig = `

# ===== IA EVOLUTION CONFIGURATION =====
ENABLE_AI=false
USE_SUPABASE=false
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4

# Adicione outras configurações conforme necessário
# Veja .env.example para lista completa
`;
      
      fs.appendFileSync(envPath, aiConfig);
      log('  ✅ Configurações da IA adicionadas ao .env.local', 'green');
    } else {
      log('  ⏭️  Configurações da IA já existem no .env.local', 'yellow');
    }
  } else {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('  ✅ Arquivo .env.local criado a partir do .env.example', 'green');
    } else {
      log('  ❌ .env.example não encontrado', 'red');
    }
  }
}

function createGitIgnoreEntry() {
  log('\n📝 Atualizando .gitignore...', 'blue');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const aiEntries = `
# IA Evolution
.env.local
/uploads/*
/temp/*
/scripts/temp/*
*.log
`;

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('# IA Evolution')) {
      fs.appendFileSync(gitignorePath, aiEntries);
      log('  ✅ Entradas da IA adicionadas ao .gitignore', 'green');
    } else {
      log('  ⏭️  .gitignore já configurado para IA', 'yellow');
    }
  } else {
    fs.writeFileSync(gitignorePath, aiEntries);
    log('  ✅ .gitignore criado com configurações da IA', 'green');
  }
}

function createPackageScripts() {
  log('\n📜 Adicionando scripts npm...', 'blue');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const newScripts = {
      'ai:test': 'node scripts/test-ai-connection.js',
      'ai:migrate': 'node scripts/migrate-to-supabase.js',
      'ai:setup-supabase': 'node scripts/setup-supabase.js',
      'ai:status': 'node scripts/check-ai-status.js',
    };
    
    let added = false;
    Object.entries(newScripts).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        added = true;
      }
    });
    
    if (added) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      log('  ✅ Scripts npm adicionados', 'green');
    } else {
      log('  ⏭️  Scripts npm já existem', 'yellow');
    }
  }
}

function createTestScript() {
  log('\n🧪 Criando script de teste...', 'blue');
  
  const testScript = `#!/usr/bin/env node

const path = require('path');

// Simular environment para teste
process.env.NODE_ENV = 'development';

async function testAIConnection() {
  console.log('🧪 Testando conexão da IA...');
  
  try {
    // Verificar se os arquivos foram criados
    const requiredFiles = [
      'lib/config/feature-flags.ts',
      'lib/ai/supabase-client.ts',
      'lib/ai/services/openai-service.ts',
      'hooks/ai/use-ai-chat.ts',
      'components/ai/AITestPanel.tsx',
    ];
    
    const missingFiles = requiredFiles.filter(file => {
      const fullPath = path.join(process.cwd(), file);
      return !require('fs').existsSync(fullPath);
    });
    
    if (missingFiles.length > 0) {
      console.log('❌ Arquivos faltando:');
      missingFiles.forEach(file => console.log(\`  - \${file}\`));
      return false;
    }
    
    console.log('✅ Todos os arquivos necessários foram criados');
    
    // Verificar configuração
    const envPath = path.join(process.cwd(), '.env.local');
    if (require('fs').existsSync(envPath)) {
      console.log('✅ Arquivo .env.local existe');
    } else {
      console.log('⚠️  Arquivo .env.local não encontrado');
    }
    
    console.log('');
    console.log('🎉 Setup da IA completado com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Configure sua OPENAI_API_KEY no .env.local');
    console.log('2. Configure ENABLE_AI=true no .env.local');
    console.log('3. Execute: npm run dev');
    console.log('4. Acesse /dashboard para ver o painel de IA');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

testAIConnection();
`;

  const testPath = path.join(process.cwd(), 'scripts/test-ai-connection.js');
  fs.writeFileSync(testPath, testScript);
  
  log('  ✅ Script de teste criado', 'green');
}

function displayNextSteps() {
  log('\n🎉 Setup da IA concluído com sucesso!', 'green');
  log('\n📋 Próximos passos:', 'bright');
  
  const steps = [
    '1. Configure sua OPENAI_API_KEY no arquivo .env.local',
    '2. Configure ENABLE_AI=true no arquivo .env.local',
    '3. Execute: npm run dev',
    '4. Acesse /dashboard para ver o painel de IA',
    '5. Teste o chat da IA',
    '6. Configure Supabase quando necessário (USE_SUPABASE=true)',
  ];
  
  steps.forEach(step => {
    log(`  ${step}`, 'cyan');
  });
  
  log('\n🔗 Links úteis:', 'bright');
  log('  - OpenAI API Keys: https://platform.openai.com/api-keys', 'blue');
  log('  - Supabase Dashboard: https://supabase.com/dashboard', 'blue');
  log('  - Documentação: Ver arquivos PLANO_*.md criados', 'blue');
  
  log('\n🚀 Para testar a configuração:', 'bright');
  log('  npm run ai:test', 'green');
}

// Função principal
function main() {
  log('🤖 Gira.ai - Setup da Evolução com IA', 'bright');
  log('=====================================', 'bright');
  
  try {
    createDirectoryStructure();
    installDependencies();
    createEnvFile();
    createGitIgnoreEntry();
    createPackageScripts();
    createTestScript();
    displayNextSteps();
    
    log('\n✨ Setup concluído! Sua jornada para a IA está começando...', 'magenta');
    
  } catch (error) {
    log(\`\n❌ Erro durante o setup: \${error.message}\`, 'red');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };