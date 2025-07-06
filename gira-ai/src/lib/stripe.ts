import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
})

// Planos do gira.ai
export const PLANS = {
  free: {
    name: 'Gratuito',
    price: 0,
    priceId: null,
    features: [
      'Até 5 análises financeiras por mês',
      'Até 10 posts para redes sociais',
      'Até 20 mensagens WhatsApp',
      'Suporte por email'
    ],
    limits: {
      financial_analyses: 5,
      content_generations: 10,
      whatsapp_messages: 20
    }
  },
  starter: {
    name: 'Iniciante',
    price: 39.90,
    priceId: 'price_starter_monthly',
    features: [
      'Até 50 análises financeiras por mês',
      'Até 100 posts para redes sociais',
      'Até 200 mensagens WhatsApp',
      'Dashboard analytics',
      'Relatórios PDF',
      'Suporte prioritário'
    ],
    limits: {
      financial_analyses: 50,
      content_generations: 100,
      whatsapp_messages: 200
    }
  },
  professional: {
    name: 'Profissional',
    price: 89.90,
    priceId: 'price_professional_monthly',
    features: [
      'Análises financeiras ilimitadas',
      'Posts ilimitados para redes sociais',
      'Mensagens WhatsApp ilimitadas',
      'CRM integrado',
      'Agendamento automático',
      'Templates personalizados',
      'API access',
      'Suporte 24/7'
    ],
    limits: {
      financial_analyses: -1, // ilimitado
      content_generations: -1,
      whatsapp_messages: -1
    }
  },
  enterprise: {
    name: 'Empresarial',
    price: 199.90,
    priceId: 'price_enterprise_monthly',
    features: [
      'Tudo do plano Profissional',
      'White label customizável',
      'Múltiplos usuários (até 10)',
      'Integração com ERP',
      'Automações avançadas',
      'Análises preditivas',
      'Consultor dedicado',
      'SLA garantido'
    ],
    limits: {
      financial_analyses: -1,
      content_generations: -1,
      whatsapp_messages: -1,
      users: 10
    }
  }
}

// Criar sessão de checkout
export async function createCheckoutSession(
  userId: string,
  planId: keyof typeof PLANS,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PLANS[planId]
  
  if (!plan.priceId) {
    throw new Error('Plano gratuito não requer pagamento')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
    })

    return session
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    throw error
  }
}

// Criar portal do cliente
export async function createCustomerPortal(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Erro ao criar portal do cliente:', error)
    throw error
  }
}

// Verificar status da assinatura
export async function getSubscriptionStatus(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return { status: 'inactive', plan: 'free' }
    }

    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0].price.id

    // Encontrar o plano baseado no priceId
    const plan = Object.entries(PLANS).find(([_, planData]) => 
      planData.priceId === priceId
    )?.[0] || 'free'

    return {
      status: subscription.status,
      plan,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    }
  } catch (error) {
    console.error('Erro ao verificar status da assinatura:', error)
    return { status: 'inactive', plan: 'free' }
  }
}

// Verificar limites de uso
export async function checkUsageLimits(
  userId: string,
  feature: 'financial_analyses' | 'content_generations' | 'whatsapp_messages',
  currentUsage: number
) {
  // Aqui você pegaria o plano atual do usuário do banco de dados
  // Por agora, vou simular com plano free
  const userPlan = 'free' // Isso viria do banco de dados
  const plan = PLANS[userPlan as keyof typeof PLANS]
  
  const limit = plan.limits[feature]
  
  if (limit === -1) return { allowed: true, remaining: -1 } // ilimitado
  
  const remaining = limit - currentUsage
  const allowed = remaining > 0
  
  return { allowed, remaining, limit }
}

// Criar cupom de desconto
export async function createPromotionCode(
  code: string,
  percentOff: number,
  duration: 'once' | 'repeating' | 'forever',
  durationInMonths?: number
) {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration,
      duration_in_months: duration === 'repeating' ? durationInMonths : undefined,
    })

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      active: true,
    })

    return promotionCode
  } catch (error) {
    console.error('Erro ao criar código promocional:', error)
    throw error
  }
}