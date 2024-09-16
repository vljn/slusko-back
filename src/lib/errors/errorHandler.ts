import { NextFunction, Request, Response } from 'express';

export default function errorHandler(error: any, req: Request, res: Response, next?: NextFunction) {
  console.error(error);

  const statusCode = error.status || 500;

  const response = {
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : error.message,
    details: error.details || undefined,
  };

  res.status(statusCode).json(response);
}
