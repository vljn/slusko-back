import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30, 'Username must be under 30 characters'),
  email: z.email('Invalid email address').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().optional(),
});

export const createChallengeSchema = z.object({
  start_date: z.coerce.date({ message: 'Invalid start date format' }),
  end_date: z.coerce.date({ message: 'Invalid end date format' }).optional(),
  max_guesses: z.coerce.number().int().min(1).max(10).optional().default(6),
  category_id: z.coerce.number().int().positive('category_id must be a positive integer'),
  song_id: z.coerce.number().int().positive('song_id must be a positive integer'),
});

export const makeGuessSchema = z.object({
  challenge_id: z.coerce.number().int().positive('challenge_id must be a positive integer'),
  spotify_id: z.string().trim().min(1, 'spotify_id is required'),
});

export const uploadSongSchema = z.object({
  spotify_id: z.string().trim().min(1, 'spotify_id is required'),
  title: z.string().trim().optional(),
  artist: z.string().trim().optional(),
  album: z.string().trim().optional(),
  album_art: z.string().trim().url('album_art must be a valid URL').optional(),
  start_time: z
    .union([z.string(), z.number()])
    .optional()
    .default('00:00:00'),
  clip_durations: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map(Number);
        } catch {
          return val.split(',').map((s) => Number(s.trim()));
        }
      }
      return val;
    }, z.array(z.number().positive()))
    .optional(),
  clip_count: z.coerce.number().int().min(1).max(10).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type MakeGuessInput = z.infer<typeof makeGuessSchema>;
export type UploadSongInput = z.infer<typeof uploadSongSchema>;
