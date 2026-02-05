import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export async function csrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get('csrf-token')?.value;

  if (!token) {
    token = randomBytes(32).toString('hex');
    cookieStore.set('csrf-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  return token;
}
