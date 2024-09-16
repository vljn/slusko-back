import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import path from 'path';

import { registerControllersDynamic } from './lib/registerControllers';
import errorHandler from './lib/errors/errorHandler';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

registerControllersDynamic(app, path.join(__dirname, 'controllers'));

app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 'error' });
});

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
