import { sendWhatsApp } from "@/lib/whatsapp";
import { verifyWhatsAppSignature } from "@/lib/verifyWhatsAppSignature";

const rawBody = await request.text();
const signature = request.headers.get("x-hub-signature-256");

if (process.env.NODE_ENV === "production" && !verifyWhatsAppSignature(rawBody, signature)) {
  return new NextResponse("Invalid signature", { status: 403 });
}

const body = JSON.parse(rawBody);