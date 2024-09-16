import { Router } from 'express';
import Controller from './baseController';

export default function registerControllers(
  router: any,
  controllers: Array<new (router: Router) => Controller>
): void {
  controllers.forEach((controllerClass) => {
    const controller = new controllerClass(router);
    controller.connect();
  });
}
