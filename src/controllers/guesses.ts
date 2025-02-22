import { Request, Response, Router } from 'express';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAuthenticated } from '../lib/middleware/auth';
import prisma from '../config/prisma';

export default class GuessesController extends Controller {
  constructor(router: Router) {
    super('/guesses', router);
  }

  @Middleware([isAuthenticated])
  @Post('/')
  public async makeGuess(req: Request, res: Response) {
    const { challenge_id: challengeId, spotify_id: spotifyId } = req.body;

    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(challengeId) },
      include: { song: true },
    });
    if (!challenge) {
      return res.status(404).json({ status: 'error', message: 'Challenge not found' });
    }
    if (challenge.startDate > new Date()) {
      return res.status(400).json({ status: 'error', message: 'Challenge has not started' });
    }
    if (challenge.endDate < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Challenge has ended' });
    }

    const madeGuesses = await prisma.guess.findMany({ where: { userId: req.user?.id } });
    if (madeGuesses.length >= challenge.maxGuesses) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Maximum number of guesses reached' });
    }
    if (madeGuesses.some((guess) => guess.isCorrect)) {
      return res
        .status(400)
        .json({ status: 'error', message: 'You have already guessed correctly' });
    }
    if (madeGuesses.some((guess) => guess.submittedSpotifyId === spotifyId)) {
      return res.status(400).json({ status: 'error', message: 'You have already made this guess' });
    }

    // TODO add checking for same songs on spotify with different ids
    const isCorrect = challenge.song.spotifyId === spotifyId;
    const guess = await prisma.guess.create({
      data: {
        challenge: { connect: { id: parseInt(challengeId) } },
        submittedSpotifyId: spotifyId,
        user: { connect: { id: req.user?.id } },
        isCorrect,
      },
    });

    res.status(201).json({ status: 'success', guesses: [...madeGuesses, guess] });
  }
}
