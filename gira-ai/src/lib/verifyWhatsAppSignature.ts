import crypto from "crypto";

export function verifyWhatsAppSignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signature) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}