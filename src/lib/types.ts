import { RequestHandler } from 'express';

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RouteDefinition {
  path: string;
  method: HTTPMethod;
  methodName: string | symbol;
  middleware?: Array<RequestHandler>;
}

export interface MiddlewareDefinition {
  methodName: string | symbol;
  middleware: RequestHandler;
}

export interface userPayload {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface userDecoded {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  iat: number;
  exp: number;
  iss: 'slusko';
}
