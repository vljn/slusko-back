import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

import Controller from '../lib/baseController';
import { Get, Middleware, Post } from '../lib/decorators';
import { isAdmin, isAuthenticated } from '../lib/middleware/auth';
import uploadSong from '../config/multer';
import ffmpeg from '../config/ffmpeg';
import prisma from '../config/prisma';

export default class SongsController extends Controller {
  constructor(router: Router) {
    super('/songs', router);
  }

  @Get('/')
  public async getAllSongs(req: Request, res: Response) {
    const songs = await prisma.song.findMany();

    res.json({ status: 'success', songs });
  }

  // TODO validation
  // TODO errors

  @Middleware([isAuthenticated, isAdmin, uploadSong.single('song')])
  @Post('/')
  public async uploadSong(req: Request, res: Response) {
    const spotifyId = req.body.spotify_id;
    const song = await prisma.song.create({ data: { spotifyId } });

    const file = req.file?.path as string;
    const filename = path.parse(file).name;
    const ext = path.parse(file).ext;

    const durations = [2, 4, 9, 15, 22, 30];
    durations.forEach((duration, index) => {
      const clipPath = path.join('songs', filename + `clip${index}` + ext);
      ffmpeg(req.file?.path)
        .setStartTime('00:00:00')
        .setDuration(duration)
        .output(clipPath)
        .on('end', async () => {
          if (index === durations.length - 1) {
            fs.rmSync(file);
          }
          await prisma.songClip.create({
            data: { fileName: filename + ext, order: index, song: { connect: { id: song.id } } },
          });
        })
        .run();
    });
    res.status(201).json({ status: 'success' });
  }
}
