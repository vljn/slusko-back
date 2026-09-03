import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

import Controller from '../lib/baseController';
import { Get, Middleware, Post, Delete } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import uploadSong from '../config/multer';
import ffmpeg from '../config/ffmpeg';
import prisma from '../config/prisma';
import gameRules from '../config/game';

export default class SongsController extends Controller {
  constructor(router: Router) {
    super('/songs', router);
  }

  @Get('/')
  public async getAllSongs(req: Request, res: Response) {
    const songs = await prisma.song.findMany();

    res.json({ status: 'success', songs });
  }

  @Get('/:id')
  public async getSongById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const song = await prisma.song.findUnique({
      where: { id },
      include: { clips: true },
    });
    if (!song) {
      return res.status(404).json({ status: 'error', message: 'Song not found' });
    }

    res.json({ status: 'success', song });
  }

  // TODO validation
  // TODO errors
  // TODO add custom clip durations
  // TODO add custom clip count
  // TODO add custom start time

  @Middleware([isAuthenticated, isAdmin, uploadSong.single('song')])
  @Post('/')
  public async uploadSong(req: Request, res: Response) {
    const spotifyId = req.body.spotify_id;
    const song = await prisma.song.create({ data: { spotifyId } });

    const file = req.file?.path as string;
    const filename = path.parse(file).name;
    const ext = path.parse(file).ext;

    const durations = gameRules.clipDurations;
    durations.forEach((duration, index) => {
      const clipPath = path.join('songs', filename + `clip${index + 1}` + ext);
      ffmpeg(req.file?.path)
        .audioFilters('silenceremove=1:0:-50dB') // mozda
        .setStartTime('00:00:00')
        .setDuration(duration)
        .output(clipPath)
        .on('end', async () => {
          if (index === durations.length - 1) {
            fs.rmSync(file);
          }
          await prisma.songClip.create({
            data: {
              fileName: filename + ext,
              order: index + 1,
              song: { connect: { id: song.id } },
            },
          });
        })
        .run();
    });
    res.status(201).json({ status: 'success', song: { id: song.id, spotifyId } });
  }

  // TODO delete song
  @Middleware([isAuthenticated, isAdmin])
  @Delete('/:id')
  public async deleteSong(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return res.status(404).json({ status: 'error', message: 'Song not found' });
    }

    const clips = await prisma.songClip.findMany({ where: { songId: id } });
    clips.forEach((clip) => {
      const clipPath = path.join('songs', clip.fileName);
      if (fs.existsSync(clipPath)) {
        fs.unlinkSync(clipPath);
      }
    });

    await prisma.song.delete({ where: { id } });

    res.json({ status: 'success', message: 'Song deleted successfully' });
  }
}
