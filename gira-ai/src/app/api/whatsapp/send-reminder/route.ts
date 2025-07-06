import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppReminder, sendAppointmentConfirmation, sendAutoResponse } from '@/lib/twilio'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { 
      type, 
      phoneNumber, 
      businessName, 
      appointmentTime, 
      serviceName,
      businessAddress,
      businessHours,
      appointmentId 
    } = await request.json()

    if (!type || !phoneNumber || !businessName) {
      return NextResponse.json({ 
        error: 'Tipo, telefone e nome do negócio são obrigatórios' 
      }, { status: 400 })
    }

    let result
    
    switch (type) {
      case 'reminder':
        if (!appointmentTime) {
          return NextResponse.json({ 
            error: 'Horário do agendamento é obrigatório para lembretes' 
          }, { status: 400 })
        }
        result = await sendWhatsAppReminder(
          phoneNumber, 
          businessName, 
          appointmentTime, 
          serviceName
        )
        break

      case 'confirmation':
        if (!appointmentTime || !serviceName) {
          return NextResponse.json({ 
            error: 'Horário e serviço são obrigatórios para confirmações' 
          }, { status: 400 })
        }
        result = await sendAppointmentConfirmation(
          phoneNumber,
          businessName,
          appointmentTime,
          serviceName,
          businessAddress
        )
        break

      case 'auto_response':
        result = await sendAutoResponse(
          phoneNumber,
          businessName,
          businessHours
        )
        break

      default:
        return NextResponse.json({ 
          error: 'Tipo de mensagem inválido' 
        }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 })
    }

    // Salvar log da mensagem enviada
    const { error: logError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        message_type: type,
        phone_number: phoneNumber,
        business_name: businessName,
        message_id: result.messageId,
        appointment_id: appointmentId,
        sent_at: new Date().toISOString(),
        success: true
      })

    if (logError) {
      console.error('Erro ao salvar log:', logError)
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Mensagem enviada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// API para agendar lembretes automáticos
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { 
      appointmentId,
      phoneNumber,
      appointmentTime,
      serviceName,
      reminderMinutes = 60 // 1 hora antes por padrão
    } = await request.json()

    if (!appointmentId || !phoneNumber || !appointmentTime) {
      return NextResponse.json({ 
        error: 'ID do agendamento, telefone e horário são obrigatórios' 
      }, { status: 400 })
    }

    // Calcular quando enviar o lembrete
    const appointmentDate = new Date(appointmentTime)
    const reminderTime = new Date(appointmentDate.getTime() - (reminderMinutes * 60 * 1000))

    // Salvar agendamento de lembrete
    const { error: scheduleError } = await supabase
      .from('scheduled_reminders')
      .insert({
        user_id: user.id,
        appointment_id: appointmentId,
        phone_number: phoneNumber,
        appointment_time: appointmentTime,
        service_name: serviceName,
        reminder_time: reminderTime.toISOString(),
        status: 'scheduled'
      })

    if (scheduleError) {
      console.error('Erro ao agendar lembrete:', scheduleError)
      return NextResponse.json({ 
        error: 'Erro ao agendar lembrete' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reminderTime: reminderTime.toISOString(),
      message: 'Lembrete agendado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao agendar lembrete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// API para processar lembretes pendentes (chamada por cron job)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Buscar lembretes que devem ser enviados agora
    const now = new Date()
    const { data: pendingReminders, error } = await supabase
      .from('scheduled_reminders')
      .select('*')
      .eq('status', 'scheduled')
      .lte('reminder_time', now.toISOString())
      .limit(50) // Processar no máximo 50 por vez

    if (error) {
      console.error('Erro ao buscar lembretes:', error)
      return NextResponse.json({ error: 'Erro ao buscar lembretes' }, { status: 500 })
    }

    const results = []

    for (const reminder of pendingReminders) {
      try {
        // Buscar dados do usuário para pegar o nome do negócio
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('business_name')
          .eq('user_id', reminder.user_id)
          .single()

        const businessName = userProfile?.business_name || 'Seu negócio'

        // Enviar lembrete
        const result = await sendWhatsAppReminder(
          reminder.phone_number,
          businessName,
          new Date(reminder.appointment_time).toLocaleString('pt-BR'),
          reminder.service_name
        )

        // Atualizar status
        await supabase
          .from('scheduled_reminders')
          .update({ 
            status: result.success ? 'sent' : 'failed',
            sent_at: now.toISOString(),
            error_message: result.error || null
          })
          .eq('id', reminder.id)

        results.push({
          reminderId: reminder.id,
          success: result.success,
          messageId: result.messageId
        })

      } catch (err) {
        console.error(`Erro ao processar lembrete ${reminder.id}:`, err)
        results.push({
          reminderId: reminder.id,
          success: false,
          error: err
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })

  } catch (error) {
    console.error('Erro ao processar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}