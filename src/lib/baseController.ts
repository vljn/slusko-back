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

    console.log('-------------------------------------------------------------');
    console.log('registering routes for ' + (this as Object).constructor.name);
    routes.forEach((route) => {
      const fullPath = this.base + route.path;
      const method = route.method;

      const routeMiddlewares = middlewares.filter(
        (middleware) => middleware.methodName === route.methodName
      );
      routeMiddlewares.forEach((middleware) =>
        this.router[method](fullPath, middleware.middleware)
      );
      this.router[method](fullPath, this[route.methodName as keyof this] as RequestHandler);

      console.log(
        `${method.toUpperCase()} on ${fullPath}; ${
          routeMiddlewares.length > 0
            ? `middleware: [${routeMiddlewares.map((m) => m.middleware.name)}]; `
            : ''
        }controller method: ${(this as Object).constructor.name}.${route.methodName.toString()}`
      );
    });
  }
}
