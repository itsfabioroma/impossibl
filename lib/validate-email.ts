import { promises as dns } from "dns";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* format + MX record check */
export async function isValidEmail(email: string): Promise<boolean> {
  if (!EMAIL_RE.test(email)) return false;

  const domain = email.split("@")[1];

  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}
