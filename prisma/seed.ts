import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const clientePassword = await bcrypt.hash('cliente123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@malibi.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@malibi.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@malibi.com' },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      email: 'cliente@malibi.com',
      password: clientePassword,
      phone: '(11) 99999-9999',
      role: 'CUSTOMER',
    },
  })

  console.log('✅ Usuários criados')

  // Criar categorias
  const conjuntos = await prisma.category.upsert({
    where: { slug: 'conjuntos' },
    update: {},
    create: {
      name: 'Conjuntos',
      slug: 'conjuntos',
      description: 'Conjuntos completos para você se sentir especial',
      imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    },
  })

  const sutias = await prisma.category.upsert({
    where: { slug: 'sutias' },
    update: {},
    create: {
      name: 'Sutiãs',
      slug: 'sutias',
      description: 'Conforto e estilo para o dia a dia',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    },
  })

  const calcinhas = await prisma.category.upsert({
    where: { slug: 'calcinhas' },
    update: {},
    create: {
      name: 'Calcinhas',
      slug: 'calcinhas',
      description: 'Modelos únicos para todos os momentos',
      imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=500&fit=crop',
    },
  })

  const bodies = await prisma.category.upsert({
    where: { slug: 'bodies' },
    update: {},
    create: {
      name: 'Bodies',
      slug: 'bodies',
      description: 'Sensualidade e elegância em uma peça',
      imageUrl: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=400&h=500&fit=crop',
    },
  })

  const acessorios = await prisma.category.upsert({
    where: { slug: 'acessorios' },
    update: {},
    create: {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Finalize seu look com charme',
      imageUrl: 'https://images.unsplash.com/photo-1506629905208-b51c83322db6?w=400&h=500&fit=crop',
    },
  })

  console.log('✅ Categorias criadas')

  // Criar produtos
  const produtos = [
    // Conjuntos
    {
      name: 'Conjunto Elegance Rosa',
      slug: 'conjunto-elegance-rosa',
      description: 'Conjunto delicado em renda francesa com detalhes em cetim. Perfeito para momentos especiais.',
      basePrice: 89.90,
      categoryId: conjuntos.id,
      featured: true,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: 'P', color: 'Rosa', stock: 10, price: 89.90 },
          { size: 'M', color: 'Rosa', stock: 15, price: 89.90 },
          { size: 'G', color: 'Rosa', stock: 8, price: 89.90 },
          { size: 'P', color: 'Preto', stock: 12, price: 89.90 },
          { size: 'M', color: 'Preto', stock: 18, price: 89.90 },
          { size: 'G', color: 'Preto', stock: 10, price: 89.90 },
        ]
      }
    },
    {
      name: 'Conjunto Luxo Bordado',
      slug: 'conjunto-luxo-bordado',
      description: 'Conjunto premium com bordados exclusivos e acabamento impecável.',
      basePrice: 149.90,
      categoryId: conjuntos.id,
      featured: true,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=500&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506629905208-b51c83322db6?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: 'P', color: 'Branco', stock: 5, price: 149.90 },
          { size: 'M', color: 'Branco', stock: 8, price: 149.90 },
          { size: 'G', color: 'Branco', stock: 6, price: 149.90 },
          { size: 'P', color: 'Champagne', stock: 4, price: 149.90 },
          { size: 'M', color: 'Champagne', stock: 6, price: 149.90 },
        ]
      }
    },
    // Sutiãs
    {
      name: 'Sutiã Push-Up Comfort',
      slug: 'sutia-push-up-comfort',
      description: 'Sutiã push-up com bojo moldado e alças ajustáveis para máximo conforto.',
      basePrice: 45.90,
      categoryId: sutias.id,
      featured: false,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: '42', color: 'Nude', stock: 20, price: 45.90 },
          { size: '44', color: 'Nude', stock: 25, price: 45.90 },
          { size: '46', color: 'Nude', stock: 15, price: 45.90 },
          { size: '42', color: 'Preto', stock: 18, price: 45.90 },
          { size: '44', color: 'Preto', stock: 22, price: 45.90 },
        ]
      }
    },
    {
      name: 'Sutiã Sem Bojo Natural',
      slug: 'sutia-sem-bojo-natural',
      description: 'Sutiã sem bojo em microfibra ultraconfortável para uso diário.',
      basePrice: 39.90,
      categoryId: sutias.id,
      featured: false,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: '40', color: 'Branco', stock: 30, price: 39.90 },
          { size: '42', color: 'Branco', stock: 35, price: 39.90 },
          { size: '44', color: 'Branco', stock: 25, price: 39.90 },
          { size: '40', color: 'Skin', stock: 28, price: 39.90 },
          { size: '42', color: 'Skin', stock: 32, price: 39.90 },
        ]
      }
    },
    // Bodies
    {
      name: 'Body Sensual Renda',
      slug: 'body-sensual-renda',
      description: 'Body em renda com decote profundo e fechamento por colchetes.',
      basePrice: 75.90,
      categoryId: bodies.id,
      featured: true,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=500&h=600&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: 'P', color: 'Preto', stock: 12, price: 75.90 },
          { size: 'M', color: 'Preto', stock: 15, price: 75.90 },
          { size: 'G', color: 'Preto', stock: 8, price: 75.90 },
          { size: 'P', color: 'Vinho', stock: 10, price: 75.90 },
          { size: 'M', color: 'Vinho', stock: 12, price: 75.90 },
        ]
      }
    },
    // Calcinhas
    {
      name: 'Calcinha Fio Dental Delicada',
      slug: 'calcinha-fio-dental-delicada',
      description: 'Calcinha fio dental em renda com elastano para perfeito caimento.',
      basePrice: 29.90,
      categoryId: calcinhas.id,
      featured: false,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: 'P', color: 'Rosa', stock: 25, price: 29.90 },
          { size: 'M', color: 'Rosa', stock: 30, price: 29.90 },
          { size: 'G', color: 'Rosa', stock: 20, price: 29.90 },
          { size: 'P', color: 'Preto', stock: 28, price: 29.90 },
          { size: 'M', color: 'Preto', stock: 35, price: 29.90 },
          { size: 'G', color: 'Preto', stock: 25, price: 29.90 },
        ]
      }
    },
    {
      name: 'Calcinha Boxer Confort',
      slug: 'calcinha-boxer-confort',
      description: 'Calcinha boxer em algodão premium para máximo conforto.',
      basePrice: 35.90,
      categoryId: calcinhas.id,
      featured: false,
      imageUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1506629905208-b51c83322db6?w=500&h=600&fit=crop',
      ]),
      variants: {
        create: [
          { size: 'P', color: 'Cinza', stock: 22, price: 35.90 },
          { size: 'M', color: 'Cinza', stock: 28, price: 35.90 },
          { size: 'G', color: 'Cinza', stock: 18, price: 35.90 },
          { size: 'P', color: 'Azul', stock: 20, price: 35.90 },
          { size: 'M', color: 'Azul', stock: 25, price: 35.90 },
        ]
      }
    }
  ]

  for (const produto of produtos) {
    await prisma.product.upsert({
      where: { slug: produto.slug },
      update: {},
      create: produto,
    })
  }

  console.log('✅ Produtos criados')
  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })