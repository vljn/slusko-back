import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import prisma from '../config/prisma';

export default class ChallengesControllers extends Controller {
  constructor(router: Router) {
    super('/challenges', router);
  }

  // TODO implement get challenges for all categories
  // TODO implement today challenge for all categories
  @Middleware([isAuthenticated])
  @Get('/today')
  public async getTodayChallenge(req: Request, res: Response) {
    const today = new Date();
    const challenge = await prisma.challenge.findFirst({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: { category: true },
      omit: { songId: true },
    });

    if (!challenge) {
      return res.status(404).json({ status: 'error', message: 'No challenge today' });
    }

    res.json({ status: 'success', challenge });
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

  @Middleware([isAuthenticated])
  @Get('/:id')
  public async getChallenge(req: Request, res: Response) {
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        song: {
          omit: { spotifyId: true, id: true },
          include: {
            clips: {
              where: {
                order: {
                  equals: 1 + (await prisma.guess.count({ where: { userId: req.user?.id } })),
                },
              },
              omit: {
                songId: true,
                id: true,
              },
            },
          },
        },
      },
      omit: { songId: true },
    });

    if (!challenge) {
      return res.status(404).json({ status: 'error', message: 'Challenge not found' });
    }

    res.json({ status: 'success', challenge });
  }

  // TODO validation (check for song and category existence)
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
