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

export function registerControllersDynamic(router: Router, controllersDir: string) {
  fs.readdir(controllersDir, { recursive: true }, (error, files) => {
    if (error) {
      console.error(error);
      return;
    }
    files.forEach((file) => {
      const required = require(path.join(controllersDir, file as string));
      if (required.default) {
        const controllerClass = required.default;
        const controller = new controllerClass(router);
        controller.connect();
      }
    });
  });
}
