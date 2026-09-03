# Slusko - Music Guessing Game

A Wordle-like game for music lovers. Guess the song based on audio clips and metadata!

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- FFmpeg (for audio processing)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

## Project Structure

```
src/
├── controllers/      # Route handlers for each feature
│   ├── auth.ts      # Authentication (login, register)
│   ├── challenges.ts # Daily challenge management
│   ├── guesses.ts   # Guess submission & scoring
│   ├── songs.ts     # Song management
│   ├── categories.ts # Category management
│   └── users.ts     # User profiles
├── lib/
│   ├── decorators.ts    # Route & middleware decorators (@Get, @Post, etc)
│   ├── baseController.ts # Base controller class with route registration
│   ├── jwt.ts          # JWT token generation & verification
│   ├── middleware/     # Auth & request middlewares
│   └── errors/         # Error handling
├── config/
│   ├── prisma.ts    # Prisma client
│   ├── multer.ts    # File upload config
│   ├── ffmpeg.ts    # FFmpeg config
│   └── game.ts      # Game rules config
└── types.ts         # TypeScript type definitions
```

## Features

- **Authentication** - Secure login/register with JWT tokens
- **Daily Challenges** - New challenge each day per category
- **Guess Submission** - Submit guesses and get instant feedback
- **User Profiles** - Track stats and streaks
- **Song Management** - Manage songs and audio clips
- **Categories** - Organize challenges by genre/theme

## API Endpoints

### Auth
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout & revoke token

### Challenges
- `GET /challenges` - Get all challenges
- `GET /challenges/today` - Get today's challenge (requires auth)
- `GET /challenges/:id` - Get specific challenge with clips

### Guesses
- `POST /guesses` - Submit a guess (requires auth)
- `GET /guesses/:challengeId` - Get user's guesses for challenge

### Users
- `GET /users/me` - Get current user profile
- `GET /users/leaderboard` - Get top players

### Songs
- `GET /songs` - Get all songs
- `POST /songs` - Create song (admin only)

## Decorator System

This project uses a custom TypeScript decorator system inspired by NestJS:

```typescript
import { Get, Post, Middleware } from '@lib/decorators';
import { isAuthenticated } from '@lib/middleware/auth';

export default class MyController extends Controller {
  constructor(router: Router) {
    super('/my-route', router);
  }

  @Get('/endpoint')
  public async getEndpoint(req: Request, res: Response) {
    // Handle request
  }

  @Middleware([isAuthenticated])
  @Post('/protected')
  public async protectedEndpoint(req: Request, res: Response) {
    // Requires authentication
  }
}
```

### Available Decorators
- `@Get(path)` - GET request handler
- `@Post(path)` - POST request handler
- `@Put(path)` - PUT request handler
- `@Patch(path)` - PATCH request handler
- `@Delete(path)` - DELETE request handler
- `@Middleware(middlewares)` - Apply middleware to route

## Database Schema

### Core Models
- **User** - Player profile with email & password
- **Challenge** - Daily game challenge with time window
- **Song** - Song metadata from Spotify
- **SongClip** - Audio clips for game (10-30 seconds)
- **Guess** - User's submission attempt
- **Category** - Challenge category/genre
- **Token** - JWT token storage for logout functionality

## How the Game Works

1. Each day has one challenge per category
2. User gets a 10-30 second audio clip
3. User has 6 attempts to guess the song
4. Correct guess = points & streak continues
5. Failed guess = lose 1 attempt
6. Streaks reset daily

## Development

```bash
# Build TypeScript
npm run build

# Run in production
npm start

# Watch mode (with nodemon)
npm run dev
```

## TODO

- [ ] Error handling & validation (WIP)
- [ ] Logout endpoint & token revocation
- [ ] Daily challenge rotation
- [ ] FFmpeg audio clip generation
- [ ] Spotify API integration
- [ ] Leaderboard & statistics
- [ ] Email verification
- [ ] Rate limiting

## License

MIT
