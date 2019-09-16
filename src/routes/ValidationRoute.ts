import { Router } from 'express';
import { inject, injectable, optional } from 'inversify';

import { ValidationController } from '../controller/ValidationController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

@injectable()
export class ValidationRoute extends CommonRoute {
  protected prefix: string = '/validation';
  constructor(
    @inject(ValidationController) public controller: ValidationController,
    @optional() router: Router = Router(),
  ) {
    super(router);
    this.route(EN_REQUEST_METHODS.POST)('/iap/apple', controller.validateAppleReceipt.bind(this.controller));
    this.route(EN_REQUEST_METHODS.POST)('/iap/google', controller.validateGoogleReceipt.bind(this.controller));
  }
}
