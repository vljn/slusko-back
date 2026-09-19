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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid song ID' });
    }

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
  // TODO add custom clip durations
  // TODO add custom clip count
  // TODO add custom start time

  @Middleware([isAuthenticated, isAdmin, uploadSong.single('song')])
  @Post('/')
  public async uploadSong(req: Request, res: Response) {
    const spotifyId = req.body.spotify_id;
    if (!spotifyId) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ status: 'error', message: 'spotify_id is required' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No audio file uploaded' });
    }

    const file = req.file.path;
    const filename = path.parse(file).name;
    const ext = path.parse(file).ext;
    const durations = gameRules.clipDurations;

    const existingSong = await prisma.song.findUnique({ where: { spotifyId } });
    if (existingSong) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
      return res
        .status(400)
        .json({ status: 'error', message: 'Song with this spotify_id already exists' });
    }

    const createdClipPaths: string[] = [];

    try {
      const slicePromises = durations.map((duration, index) => {
        const clipFileName = `${filename}clip${index + 1}${ext}`;
        const clipPath = path.resolve(__dirname, '../../clips', clipFileName);
        createdClipPaths.push(clipPath);

        return new Promise<{ fileName: string; order: number }>((resolve, reject) => {
          ffmpeg(file)
            .audioFilters('silenceremove=1:0:-50dB')
            .setStartTime('00:00:00')
            .setDuration(duration)
            .output(clipPath)
            .on('end', () => resolve({ fileName: clipFileName, order: index + 1 }))
            .on('error', (err) => reject(err))
            .run();
        });
      });

      const clipsData = await Promise.all(slicePromises);

      const song = await prisma.song.create({
        data: {
          spotifyId,
          clips: {
            create: clipsData,
          },
        },
        include: { clips: true },
      });

      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }

      res.status(201).json({ status: 'success', song });
    } catch (error) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
      createdClipPaths.forEach((clipPath) => {
        if (fs.existsSync(clipPath)) {
          fs.unlinkSync(clipPath);
        }
      });
      console.error('Error processing audio upload:', error);
      res.status(500).json({ status: 'error', message: 'Failed to process audio clips' });
    }
  }

  @Middleware([isAuthenticated, isAdmin])
  @Delete('/:id')
  public async deleteSong(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid song ID' });
    }

    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) {
      return res.status(404).json({ status: 'error', message: 'Song not found' });
    }

    const clips = await prisma.songClip.findMany({ where: { songId: id } });
    clips.forEach((clip) => {
      const clipPath = path.resolve(__dirname, '../../clips', clip.fileName);
      if (fs.existsSync(clipPath)) {
        fs.unlinkSync(clipPath);
      }
    });

    await prisma.songClip.deleteMany({ where: { songId: id } });
    await prisma.song.delete({ where: { id } });

    res.json({ status: 'success', message: 'Song deleted successfully' });
  }
}
