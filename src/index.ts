import express from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';

import UsersController from './controllers/users';
import registerControllers from './lib/registerControllers';
import AuthController from './controllers/auth';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

registerControllers(app, [UsersController, AuthController]);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
