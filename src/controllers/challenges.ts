import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import prisma from '../config/prisma';

export default class ChallengesControllers extends Controller {
  constructor(router: Router) {
    super('/challenges', router);
  }

  // TODO add filtering and searching
  // TODO get specific challenge with it's song clips
  // TODO add admin view
  @Get('/')
  public async getAllChallenges(req: Request, res: Response) {
    const challenges = await prisma.challenge.findMany({
      include: { category: true },
      omit: { songId: true },
    });

    res.json({ status: 'success', challenges });
  }

  @Middleware([isAuthenticated, isAdmin])
  @Post('/')
  public async createChallenge(req: Request, res: Response) {
    const {
      start_date: startDate,
      end_date: endDate,
      max_guesses: maxGuesses,
      category_id: categoryId,
      song_id: songId,
    } = req.body;
    const dates = { start: startDate, end: endDate };
    dates.start = new Date(startDate);
    dates.end = dates.end
      ? new Date(dates.end)
      : new Date(dates.start.getTime() + 1000 * 60 * 60 * 24);
    const challenge = await prisma.challenge.create({
      data: {
        startDate: dates.start,
        endDate: dates.end,
        maxGuesses,
        category: { connect: { id: parseInt(categoryId) } },
        song: { connect: { id: parseInt(songId) } },
      },
    });

    res.status(201).json({ status: 'success', challenge });
  }
}
