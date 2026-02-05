import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = randomBytes(32).toString('hex');
  res.setHeader(
    'Set-Cookie',
    `csrf-token=${token}; HttpOnly; Path=/; SameSite=Strict`
  );
  res.status(200).json({ token });
}
