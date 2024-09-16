import { NextFunction, Request, RequestHandler, Response } from 'express';
import { HTTPMethod, MiddlewareDefinition, RouteDefinition } from './types';

type ExpressRequestHandler = (req: Request, res: Response, next?: NextFunction) => any;

export function Route(path: string, method: HTTPMethod) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ExpressRequestHandler>
  ) {
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor) || [];
    routes.push({ method, path, methodName: propertyKey });

    Reflect.defineMetadata('routes', routes, target.constructor);
  };
}

export function Middleware(middlewares: Array<RequestHandler>) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ExpressRequestHandler>
  ) {
    const storedMiddlewares: MiddlewareDefinition[] =
      Reflect.getMetadata('middlewares', target.constructor) || [];

    middlewares.forEach((middleware) => {
      storedMiddlewares.push({ methodName: propertyKey, middleware });
    });

    Reflect.defineMetadata('middlewares', storedMiddlewares, target.constructor);
  };
}

export function Get(path: string) {
  return Route(path, 'get');
}

export function Post(path: string) {
  return Route(path, 'post');
}

export function Delete(path: string) {
  return Route(path, 'delete');
}

export function Put(path: string) {
  return Route(path, 'put');
}

export function Patch(path: string) {
  return Route(path, 'patch');
}
