import 'reflect-metadata';

import * as express from 'express';
import { Container } from 'inversify';

import { CommonRoute } from './routes/CommonRoute';
import { ValidationRoute } from './routes/ValidationRoute';

/** router가 될 부분을 이곳에 추가한다. */
const routes = [ValidationRoute];

function routeList(container: Container) {
  const router = express.Router();
  routes.forEach((route) => router.use(container.resolve<CommonRoute>(route).router));
  return router;
}

export class App {
  constructor(
    protected server: express.Express = express(),
    protected container: Container = new Container({
      defaultScope: 'Singleton',
      autoBindInjectable: true,
    }),
  ) {
    this.bootstrap();
  }

  public bootstrap() {
    this.server.disable('x-powered-by');
  }

  public addService<T>(service: T, bindName: string) {
    this.container.bind<T>(bindName).toConstantValue(service);
  }

  public Server(): express.Express {
    // binding routes for containers
    routes.forEach((route) => this.container.bind(route.name).to(route));

    const getRouteList = routeList(this.container);
    this.server.use(getRouteList);

    return this.server;
  }
}
