import { UserDecoded } from '../../lib/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDecoded;
    }
  }
}
