import twilio from 'twilio'

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('Missing Twilio credentials')
}

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Função para enviar lembrete via WhatsApp
export async function sendWhatsAppReminder(
  to: string, 
  businessName: string, 
  appointmentTime: string, 
  serviceName?: string
) {
  try {
    const message = `🔔 *Lembrete - ${businessName}*

Olá! Este é um lembrete automático sobre seu agendamento:

📅 *Data/Hora:* ${appointmentTime}
${serviceName ? `🛍️ *Serviço:* ${serviceName}` : ''}

Caso precise reagendar ou cancelar, entre em contato conosco.

Obrigado! 
_Mensagem enviada automaticamente pelo gira.ai_`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message
    })

    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    return { success: false, error: 'Falha ao enviar mensagem' }
  }
}

// Função para enviar confirmação de agendamento
export async function sendAppointmentConfirmation(
  to: string,
  businessName: string,
  appointmentTime: string,
  serviceName: string,
  businessAddress?: string
) {
  try {
    const message = `✅ *Agendamento Confirmado - ${businessName}*

Seu agendamento foi confirmado com sucesso!

📅 *Data/Hora:* ${appointmentTime}
🛍️ *Serviço:* ${serviceName}
${businessAddress ? `📍 *Local:* ${businessAddress}` : ''}

Enviaremos um lembrete próximo ao horário.

Obrigado pela preferência! 
_Agendamento via gira.ai_`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message
    })

    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error)
    return { success: false, error: 'Falha ao enviar confirmação' }
  }
}

// Função para resposta automática do atendimento
export async function sendAutoResponse(
  to: string,
  businessName: string,
  businessHours?: string
) {
  try {
    const message = `👋 Olá! Obrigado por entrar em contato com *${businessName}*!

🤖 Este é nosso atendimento automático. Em breve um de nossos atendentes entrará em contato.

${businessHours ? `🕐 *Horário de funcionamento:* ${businessHours}` : ''}

Para agendamentos rápidos, você pode usar nosso sistema online.

_Powered by gira.ai_`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message
    })

    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error('Erro ao enviar resposta automática:', error)
    return { success: false, error: 'Falha ao enviar resposta' }
  }
}