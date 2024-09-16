import { RequestHandler } from 'express';

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RouteDefinition {
  path: string;
  method: HTTPMethod;
  methodName: string;
  middleware?: Array<RequestHandler>;
}

export interface MiddlewareDefinition {
  methodName: string;
  middleware: RequestHandler;
}

export interface UserPayload {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface UserDecoded {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  iat: number;
  exp: number;
  iss: 'slusko';
}
