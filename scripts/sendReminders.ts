// File: utils/sendReminders.ts

import twilio from "twilio";

// Configurações do Twilio para WhatsApp
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);
const whatsappFrom = "whatsapp:+14155238886"; // Número Twilio sandbox ou seu número verificado

export interface Reminder {
  id: string;
  userId: string;
  contactMethod: "whatsapp" | "email";
  contactAddress: string; // +55xxxxxxxxx para WhatsApp ou email para email
  message: string;
  sendAt: Date;
  sent: boolean;
}

// Função para enviar lembrete via WhatsApp (futuramente pode incluir email)
export async function sendReminder(reminder: Reminder) {
  if (reminder.sent) {
    console.log(`Lembrete ${reminder.id} já foi enviado.`);
    return;
  }

  try {
    if (reminder.contactMethod === "whatsapp") {
      await client.messages.create({
        from: whatsappFrom,
        to: `whatsapp:${reminder.contactAddress}`,
        body: reminder.message,
      });
      console.log(`Lembrete enviado via WhatsApp para ${reminder.contactAddress}`);
    } else {
      console.warn("Método de contato não suportado ainda:", reminder.contactMethod);
    }

    // Aqui você deve marcar o lembrete como enviado no banco de dados
    // await db.reminders.update({ id: reminder.id }, { sent: true });
  } catch (error) {
    console.error(`Erro ao enviar lembrete ${reminder.id}:`, error);
  }
}

// Função para enviar todos lembretes pendentes até a data atual
export async function sendPendingReminders(reminders: Reminder[]) {
  const now = new Date();

  const pendentes = reminders.filter(r => !r.sent && r.sendAt <= now);

  for (const reminder of pendentes) {
    await sendReminder(reminder);
  }
}
