import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

interface SessionData {
  userId: string;
  organizationId: string;
}

export async function getSessionContext(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch (error) {
    return null;
  }
}