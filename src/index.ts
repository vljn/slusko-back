import express from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import path from 'path';

import { registerControllersDynamic } from './lib/registerControllers';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

registerControllersDynamic(app, path.join(__dirname, 'controllers'));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
