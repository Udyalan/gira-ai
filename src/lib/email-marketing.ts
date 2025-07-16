import nodemailer from 'nodemailer'

// Configuração do transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Templates de Email

export const welcomeEmailTemplate = (userName: string, firstName: string) => ({
  subject: `Bem-vinda à Malíbi, ${firstName}! 💕`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vinda à Malíbi</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Malíbi</h1>
          <p style="color: #fce7f3; margin: 10px 0 0 0; font-size: 16px;">Lingerie Feminina Sofisticada</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${firstName}! 💕</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            É um prazer ter você conosco! Agora você faz parte da família Malíbi e tem acesso a:
          </p>
          
          <div style="background-color: #fef7ff; border-left: 4px solid #ec4899; padding: 20px; margin: 20px 0;">
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li style="margin-bottom: 8px;">✨ <strong>Frete grátis</strong> para compras acima de R$ 150</li>
              <li style="margin-bottom: 8px;">🎁 <strong>Cupom de 10% OFF</strong> na primeira compra</li>
              <li style="margin-bottom: 8px;">📏 <strong>Guia de tamanhos</strong> personalizado</li>
              <li style="margin-bottom: 8px;">💝 <strong>Lista de favoritos</strong> exclusiva</li>
              <li style="margin-bottom: 8px;">⭐ <strong>Reviews verificadas</strong> de outros clientes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/produtos?utm_source=email&utm_campaign=welcome" 
               style="background-color: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Explorar Coleção
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Use seu cupom de boas-vindas:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 6px; text-align: center; border: 2px dashed #ec4899;">
              <code style="font-size: 20px; font-weight: bold; color: #ec4899;">BEMVINDA10</code>
            </div>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">Válido por 30 dias. Desconto de 10% na primeira compra.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; text-align: center; margin: 0 0 10px 0; font-size: 14px;">
            Siga-nos nas redes sociais:
          </p>
          <div style="text-align: center;">
            <a href="#" style="margin: 0 10px; color: #ec4899; text-decoration: none;">Instagram</a>
            <a href="#" style="margin: 0 10px; color: #ec4899; text-decoration: none;">Facebook</a>
            <a href="#" style="margin: 0 10px; color: #ec4899; text-decoration: none;">Pinterest</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `Bem-vinda à Malíbi, ${firstName}! Agora você tem acesso a frete grátis, cupom de 10% OFF (BEMVINDA10) e muito mais. Explore nossa coleção em ${process.env.NEXT_PUBLIC_APP_URL}/produtos`
})

export const abandonedCartEmailTemplate = (userName: string, cartItems: any[], cartTotal: number) => ({
  subject: '💕 Você esqueceu algo especial no seu carrinho',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Não deixe escapar! 💕</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Olá! Notamos que você deixou alguns itens lindos no seu carrinho. Que tal finalizar sua compra?
          </p>
          
          ${cartItems.map(item => `
            <div style="display: flex; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
              <img src="${JSON.parse(item.product.imageUrls)[0]}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
              <div style="margin-left: 15px; flex: 1;">
                <h3 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px;">${item.product.name}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Quantidade: ${item.quantity}</p>
                <p style="margin: 5px 0 0 0; color: #ec4899; font-weight: bold;">R$ ${Number(item.product.basePrice).toFixed(2)}</p>
              </div>
            </div>
          `).join('')}
          
          <div style="background-color: #fef7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; color: #1f2937;">Total:</span>
              <span style="font-size: 24px; font-weight: bold; color: #ec4899;">R$ ${cartTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/carrinho?utm_source=email&utm_campaign=abandoned_cart" 
               style="background-color: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Finalizar Compra
            </a>
          </div>
          
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #15803d;"><strong>🚚 Frete grátis</strong> para compras acima de R$ 150!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})

export const backInStockEmailTemplate = (userName: string, product: any) => ({
  subject: `🎉 ${product.name} voltou ao estoque!`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">De volta ao estoque! 🎉</h1>
        </div>
        
        <div style="padding: 30px 20px; text-align: center;">
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
            Boa notícia! O produto que você estava esperando voltou ao estoque:
          </p>
          
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <img src="${JSON.parse(product.imageUrls)[0]}" alt="${product.name}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <h2 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 20px;">${product.name}</h2>
            <p style="margin: 0 0 15px 0; color: #6b7280;">${product.category.name}</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ec4899;">R$ ${Number(product.basePrice).toFixed(2)}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/produto/${product.slug}?utm_source=email&utm_campaign=back_in_stock" 
             style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Comprar Agora
          </a>
          
          <p style="color: #ef4444; margin: 20px 0 0 0; font-size: 14px;">
            ⚡ Estoque limitado! Garante já o seu antes que acabe novamente.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
})

export const orderConfirmationTemplate = (order: any) => ({
  subject: `Pedido confirmado #${order.orderNumber} - Malíbi 💕`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <div style="background: linear-gradient(135deg, #ec4899, #be185d); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Pedido Confirmado! 🎉</h1>
          <p style="color: #fce7f3; margin: 10px 0 0 0;">Número do pedido: ${order.orderNumber}</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Olá, ${order.customerName}! Seu pedido foi confirmado com sucesso e já está sendo preparado com todo carinho.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #15803d;">Status do Pedido</h3>
            <p style="margin: 0; color: #15803d; font-weight: bold;">✅ Pedido Confirmado</p>
            <p style="margin: 5px 0 0 0; color: #16a34a; font-size: 14px;">Estimativa de entrega: 3-7 dias úteis</p>
          </div>
          
          <h3 style="color: #1f2937; margin: 30px 0 15px 0;">Itens do Pedido:</h3>
          
          ${order.orderItems.map((item: any) => `
            <div style="display: flex; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
              <img src="${JSON.parse(item.product.imageUrls)[0]}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
              <div style="margin-left: 15px; flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: #1f2937;">${item.product.name}</h4>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Quantidade: ${item.quantity}</p>
                <p style="margin: 5px 0 0 0; color: #ec4899; font-weight: bold;">R$ ${Number(item.price).toFixed(2)}</p>
              </div>
            </div>
          `).join('')}
          
          <div style="background-color: #fef7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>R$ ${(Number(order.totalAmount) - (Number(order.discountAmount) || 0)).toFixed(2)}</span>
            </div>
            ${order.discountAmount ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #16a34a;">
                <span>Desconto:</span>
                <span>-R$ ${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb; font-weight: bold; font-size: 18px; color: #ec4899;">
              <span>Total:</span>
              <span>R$ ${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pedidos?utm_source=email&utm_campaign=order_confirmation" 
               style="background-color: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Acompanhar Pedido
            </a>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; text-align: center; margin: 0; font-size: 14px;">
            Tem dúvidas? Entre em contato: contato@malibi.com.br | WhatsApp: (11) 99999-9999
          </p>
        </div>
      </div>
    </body>
    </html>
  `
})

export const reviewRequestTemplate = (userName: string, order: any) => ({
  subject: 'Como foi sua experiência? Avalie seus produtos 💕',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Conte sua experiência! ⭐</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Olá! Esperamos que você esteja amando seus produtos Malíbi. Sua opinião é muito importante para nós!
          </p>
          
          <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #92400e;">Avalie seus produtos:</h3>
            
            ${order.orderItems.map((item: any) => `
              <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #fde68a;">
                <img src="${JSON.parse(item.product.imageUrls)[0]}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
                <div style="margin-left: 15px; flex: 1;">
                  <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px;">${item.product.name}</h4>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/produto/${item.product.slug}?review=true&utm_source=email&utm_campaign=review_request" 
                     style="color: #f59e0b; text-decoration: none; font-weight: bold; font-size: 14px;">
                    ⭐ Avaliar produto
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pedidos/${order.id}?utm_source=email&utm_campaign=review_request" 
               style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Ver Meu Pedido
            </a>
          </div>
          
          <p style="color: #6b7280; text-align: center; margin: 0; font-size: 14px;">
            Como agradecimento, você ganhará pontos no nosso programa de fidelidade! 🎁
          </p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Funções de envio de email

export const sendWelcomeEmail = async (userEmail: string, userName: string, firstName: string) => {
  try {
    const transporter = createTransporter()
    const template = welcomeEmailTemplate(userName, firstName)
    
    await transporter.sendMail({
      from: `"Malíbi Lingerie" <${process.env.SMTP_FROM}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
    
    console.log(`Welcome email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

export const sendAbandonedCartEmail = async (userEmail: string, userName: string, cartData: any) => {
  try {
    const transporter = createTransporter()
    const template = abandonedCartEmailTemplate(userName, cartData.items, cartData.total)
    
    await transporter.sendMail({
      from: `"Malíbi Lingerie" <${process.env.SMTP_FROM}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    })
    
    console.log(`Abandoned cart email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending abandoned cart email:', error)
    throw error
  }
}

export const sendOrderConfirmationEmail = async (userEmail: string, orderData: any) => {
  try {
    const transporter = createTransporter()
    const template = orderConfirmationTemplate(orderData)
    
    await transporter.sendMail({
      from: `"Malíbi Lingerie" <${process.env.SMTP_FROM}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    })
    
    console.log(`Order confirmation email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

// Automações de Email
export const setupEmailAutomations = async () => {
  // Implementar com cron jobs ou webhooks
  // Exemplo: verificar carrinhos abandonados a cada hora
  
  return {
    abandonedCartCheck: '0 */2 * * *', // A cada 2 horas
    reviewRequest: '0 10 * * *',      // Diariamente às 10h
    backInStockAlert: '0 */6 * * *'   // A cada 6 horas
  }
}