import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';

import { Get, Middleware, Post } from '../lib/decorators';
import Controller from '../lib/baseController';
import prisma from '../config/prisma';
import { generatePayloadFromUser, generateUserToken, hashToken, verifyUserToken } from '../lib/jwt';
import { isAuthenticated } from '../lib/middleware/auth';

// TODO error handling
// TODO data validation
// TODO logout (token revocation)
// TODO refresh token invalidation
// TODO add rate limiting
export default class AuthController extends Controller {
  constructor(router: Router) {
    super('/auth', router);
  }

  @Post('/register')
  public async registerUser(req: Request, res: Response) {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true },
    });

    res.status(201).json({ status: 'success', user });
  }

  @Post('/login')
  public async loginUser(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username: username } });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Wrong username or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ status: 'error', message: 'Wrong username or password' });
    }

    const payload = generatePayloadFromUser(user);
    const accessToken = await generateUserToken(payload, 'access');
    const refreshToken = await generateUserToken(payload, 'refresh');
    const hashedToken = hashToken(refreshToken);
    await prisma.token.create({ data: { token: hashedToken, user: { connect: { id: user.id } } } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ status: 'success', accessToken });
  }

  @Post('/refresh')
  public async refresh(req: Request, res: Response) {
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ status: 'error', message: 'Refresh token not provided' });
    }

    try {
      const decoded = await verifyUserToken(refreshToken);

      const hashedToken = hashToken(refreshToken);
      const match = await prisma.token.findUnique({ where: { token: hashedToken } });
      if (!match) {
        res.status(400).json({ status: 'error', message: 'Invalid refresh token' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'User not found' });
      }

      const newPayload = generatePayloadFromUser(user);
      const accessToken = await generateUserToken(newPayload, 'access');
      const newRefreshToken = await generateUserToken(newPayload, 'refresh');

      const hashedNew = hashToken(newRefreshToken);
      await prisma.token.create({ data: { token: hashedNew, user: { connect: { id: user.id } } } });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.json({ status: 'success', accessToken });
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ status: 'error', message: 'Error while validating refresh token, login again' });
    }
  }

  @Get('/me')
  @Middleware([isAuthenticated])
  public async getMe(req: Request, res: Response) {
    res.json({ status: 'success', user: req.user });
  }
}
