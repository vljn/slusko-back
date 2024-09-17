import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import prisma from '../config/prisma';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';

export default class CategoriesController extends Controller {
  constructor(router: Router) {
    super('/categories', router);
  }

  @Get('/')
  public async getAllCategories(req: Request, res: Response) {
    const categories = await prisma.category.findMany();

    res.json({ status: 'success', categories });
  }

  @Middleware([isAuthenticated, isAdmin])
  @Post('/')
  public async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });

    res.status(201).json({ status: 'success', message: 'Category created', category });
  }
}
