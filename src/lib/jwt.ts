import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

import { userDecoded, userPayload } from './types';
import { User } from '@prisma/client';

export function generateToken(payload: any, options: SignOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET as string, options, (error, token) => {
      if (error) {
        return reject(error);
      }
      resolve(token as string);
    });
  });
}

export function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}

export async function generateUserToken(payload: userPayload, type: 'access' | 'refresh') {
  if (type === 'access') {
    const token = await generateToken(payload, { expiresIn: '15min', issuer: 'slusko' });
    return token;
  }
  const token = await generateToken(payload, { expiresIn: '7d', issuer: 'slusko' });
  return token;
}

export async function verifyUserToken(token: string) {
  const decoded = (await verifyToken(token)) as userDecoded;
  return decoded;
}

export function generatePayloadFromUser(user: User) {
  return { id: user.id, username: user.username, role: user.role } as userPayload;
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function compareRefreshTokens(token: string, hash: string) {
  const providedHashed = crypto.createHash('sha256').update(token).digest('hex');
  return providedHashed === hash;
}
