import { RequestHandler, Router } from 'express';
import { MiddlewareDefinition, RouteDefinition } from './types';

export default class Controller {
  base: string;
  router: Router;

  constructor(base: string, router: Router) {
    this.base = base;
    this.router = router;
  }

  connect() {
    const middlewares: MiddlewareDefinition[] =
      Reflect.getMetadata('middlewares', (this as Object).constructor) || [];
    const routes: RouteDefinition[] =
      Reflect.getMetadata('routes', (this as Object).constructor) || [];

    const controllerName = (this as Object).constructor.name;

    if (routes.length === 0) {
      console.warn(`No routes found for controller: ${controllerName}`);
      return;
    }

    console.log('-------------------------------------------------------------');
    console.log(`Registering routes for ${controllerName}`);

    routes.forEach((route) => {
      try {
        const fullPath = (this.base + route.path).replace(/\/+/g, '/');
        const method = route.method as keyof Router;

        const routeMiddlewares = middlewares.filter(
          (middleware) => middleware.methodName === route.methodName
        );

        const handler = this[route.methodName as keyof this];
        if (typeof handler !== 'function') {
          console.error(
            `ERROR: Method ${route.methodName} not found on ${controllerName}`
          );
          return;
        }

        routeMiddlewares.forEach((middleware) => {
          (this.router[method] as any)(fullPath, middleware.middleware);
        });
        (this.router[method] as any)(fullPath, handler.bind(this) as RequestHandler);

        const middlewareInfo =
          routeMiddlewares.length > 0
            ? `[${routeMiddlewares.map((m) => m.middleware.name || 'anonymous').join(', ')}]`
            : '';

        console.log(
          `  ${method.toUpperCase().padEnd(6)} ${fullPath.padEnd(25)} → ${controllerName}.${route.methodName}() ${middlewareInfo}`
        );
      } catch (error) {
        console.error(
          `ERROR registering route ${route.path} on ${controllerName}:`,
          error instanceof Error ? error.message : error
        );
      }
    });

    console.log('-------------------------------------------------------------');
  }
}
