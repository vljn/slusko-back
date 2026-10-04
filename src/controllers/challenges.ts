import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import { validateBody } from '../lib/middleware/validate';
import { createChallengeSchema } from '../schemas';
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
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' });
    }

    const guessCount = await prisma.guess.count({
      where: {
        challengeId,
        userId: req.user?.id,
      },
    });

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        category: true,
        song: {
          select: {
            clips: {
              where: {
                order: {
                  lte: 1 + guessCount,
                },
              },
              orderBy: {
                order: 'asc',
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

  @Middleware([isAuthenticated, isAdmin, validateBody(createChallengeSchema)])
  @Post('/')
  public async createChallenge(req: Request, res: Response) {
    const {
      start_date: startDate,
      end_date: endDate,
      max_guesses: maxGuesses,
      category_id: categoryId,
      song_id: songId,
    } = req.body;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 1000 * 60 * 60 * 24);

    if (end <= start) {
      return res.status(400).json({ status: 'error', message: 'End date must be after start date' });
    }

    const [category, song] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.song.findUnique({ where: { id: songId } }),
    ]);

    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    if (!song) {
      return res.status(404).json({ status: 'error', message: 'Song not found' });
    }

    const challenge = await prisma.challenge.create({
      data: {
        startDate: start,
        endDate: end,
        maxGuesses: maxGuesses ?? 6,
        category: { connect: { id: categoryId } },
        song: { connect: { id: songId } },
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ status: 'success', challenge });
  }
}
