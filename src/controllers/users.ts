import { Request, Response } from 'express';

import { Delete, Get, Middleware } from '../lib/decorators';
import Controller from './controller';
import prisma from '../config/prisma';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';

export default class UsersController extends Controller {
  constructor(router: any) {
    super('/users', router);
  }

  @Get('/')
  public async getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({ select: { id: true, username: true, email: true } });

    res.json({ status: 'success', users: users });
  }

  @Middleware([isAuthenticated, isAdmin])
  @Delete('/:id')
  public async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });

    res.json({ status: 'success', message: 'User deleted' });
  }
}
