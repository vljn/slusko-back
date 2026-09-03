import { NextFunction, Request, RequestHandler, Response } from 'express';
import { HTTPMethod, MiddlewareDefinition, RouteDefinition } from './types';

type ExpressRequestHandler = (req: Request, res: Response, next?: NextFunction) => any;

export function Route(path: string, method: HTTPMethod) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ExpressRequestHandler>
  ) {
    if (!propertyKey || !descriptor.value) {
      console.error(`Invalid route decorator on ${(target as any).constructor.name}`);
      return;
    }

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
    if (!Array.isArray(middlewares) || middlewares.length === 0) {
      console.warn(
        `No valid middlewares provided for ${(target as any).constructor.name}.${propertyKey}`
      );
      return;
    }

    const storedMiddlewares: MiddlewareDefinition[] =
      Reflect.getMetadata('middlewares', target.constructor) || [];

    middlewares.forEach((middleware) => {
      if (typeof middleware !== 'function') {
        console.error(`Invalid middleware type on ${propertyKey}`);
        return;
      }
      storedMiddlewares.push({ methodName: propertyKey, middleware });
    });

    Reflect.defineMetadata('middlewares', storedMiddlewares, target.constructor);
  };
}

function HttpMethod(method: HTTPMethod) {
  return function (path: string) {
    return Route(path, method);
  };
}

export const Get = HttpMethod('get');
export const Post = HttpMethod('post');
export const Put = HttpMethod('put');
export const Delete = HttpMethod('delete');
export const Patch = HttpMethod('patch');
