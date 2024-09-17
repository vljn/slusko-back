import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import prisma from '../config/prisma';

export default class ChallengesControllers extends Controller {
  constructor(router: Router) {
    super('/challenges', router);
  }

  @Get('/')
  public async getAllChallenges(req: Request, res: Response) {}

  @Middleware([isAuthenticated, isAdmin])
  @Post('/')
  public async createChallenge(req: Request, res: Response) {
    const { date, max_guesses: maxGuesses, category_id: categoryId, song_id: songId } = req.body;
    const challenge = await prisma.challenge.create({
      data: {
        date: new Date(date),
        maxGuesses,
        category: { connect: { id: parseInt(categoryId) } },
        song: { connect: { id: parseInt(songId) } },
      },
    });

    res.status(201).json({ status: 'success', challenge });
  }
}
