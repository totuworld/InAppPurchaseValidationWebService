import * as BodyParser from 'body-parser';
import * as boom from 'boom';
import * as debug from 'debug';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { injectable } from 'inversify';

export declare enum EN_REQUEST_RESULT {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum EN_REQUEST_METHODS {
  ALL = 'all',
  GET = 'get',
  DELETE = 'delete',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head',
}
type strRegExp = string | RegExp;
export type TPathParams = string | RegExp | strRegExp[];
export type TRouteMethod = EN_REQUEST_METHODS;

const log = debug('InApp:CommonRoute');

@injectable()
export class CommonRoute {
  public router: Router;
  protected prefix: string = '';

  constructor(router: Router) {
    this.router = router;
  }

  public route(method: TRouteMethod): (path: TPathParams, ...handlers: RequestHandler[]) => Router {
    return (path: TPathParams, ...handlers: RequestHandler[]): Router => {
      handlers[handlers.length - 1] = this.wrapHandler(handlers[handlers.length - 1]);

      return this.router[method].apply<Router, [TPathParams, RequestHandler[]], Router>(this.router, [
        this.prefix + path,
        [BodyParser.urlencoded({ extended: false }), BodyParser.json(), ...handlers],
      ]);
    };
  }

  public wrapHandler(handler: RequestHandler) {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
      try {
        log('handler', 'excuted');
        const ret = await handler(req, res, next);
        log('handler', 'excuted return', ret);

        if (ret === null || ret === undefined) {
          next();
        }

        // boom 에러 오브젝트 반환 시!!
        log('check isBoom');
        if (boom.isBoom(ret)) {
          return res.status(ret.output.statusCode).send(ret.output.payload);
        }

        if (!!ret.type && ret.type === EN_REQUEST_RESULT.ERROR) {
          log('handler', 'error recieved');
          return res.status(ret.status).json(ret.error);
        }

        log('handler', 'handled successfully');
        return res.status(ret.status).json(ret.payload);
      } catch (error) {
        log('error', error.message);
        log('check isBoom');
        if (boom.isBoom(error)) {
          log('isBoom');
          return res.status(error.output.statusCode).send(error.output.payload);
        }
        return res.status(!!error.statusCode ? error.statusCode : 500).send(error);
      }
    };
  }
}
