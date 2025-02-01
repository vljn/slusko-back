import { Router } from 'express';
import Controller from './baseController';
import fs from 'fs';
import path from 'path';

export function registerControllers(
  router: Router,
  controllers: Array<new (router: Router) => Controller>
): void {
  controllers.forEach((controllerClass) => {
    const controller = new controllerClass(router);
    controller.connect();
  });
}

export function registerControllersDynamic(router: Router, controllersDir: string): void {
  const files = fs.readdirSync(controllersDir);
  files.forEach((file) => {
    const required = require(path.join(controllersDir, file as string));
    if (required.default) {
      const controllerClass = required.default as new (router: Router) => Controller;
      const controller = new controllerClass(router);
      controller.connect();
    }
  });
}
