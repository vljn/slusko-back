import { NextFunction, Request, Response } from 'express';
import { verifyUserToken } from '../jwt';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return res.status(401).json({ status: 'error', message: 'Access token not provided' });
  }
  const split = (req.headers.authorization as string).split(' ');
  if (split.length !== 2 || split[0] !== 'Bearer') {
    res.status(401).json({
      status: 'error',
      message: 'Authorization header invalid (should be Authorization: Bearer <access_token>)',
    });
  }
  const token = split[1];

  try {
    const decoded = await verifyUserToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Access token expired' });
    }
    res.status(401).json({ status: 'error', message: 'Invalid access token' });
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'ADMIN') {
    return next();
  }
  res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
}
