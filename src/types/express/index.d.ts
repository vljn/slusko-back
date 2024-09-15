import { userDecoded } from '../../lib/types';

declare global {
  namespace Express {
    interface Request {
      user?: userDecoded;
    }
  }
}
