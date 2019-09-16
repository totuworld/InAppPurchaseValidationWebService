import * as boom from 'boom';
import * as debug from 'debug';
import { Request, Response } from 'express';
import { ValidationResponse } from 'in-app-purchase';
import { injectable } from 'inversify';
import * as util from 'util';

import { GoogleAccessTokenHelper } from '../models/googleAccessToken';
import { IapType } from '../models/Iap';
import { InAppleReceipt } from '../models/interface/InAppleReceipt';
import { InGoogleReceipt } from '../models/interface/InGoogleReceipt';
import { IValidationResult } from '../models/interface/IValidationResult';
import JSCPostAppleReceipt from '../models/json_schema/JSCPostAppleReceipt';
import JSCPostGoogleReceipt from '../models/json_schema/JSCPostGoogleReceipt';
import { Util } from '../services/Util';
import { TControllerResp } from './ICommonController';

const log = debug('InApp:ValidationController');

const appleValidation = util.promisify<string, ValidationResponse>(IapType.getInstance().iap.validate);

@injectable()
export class ValidationController {
  /** 애플 영수증 검증 */
  public async validateAppleReceipt(req: Request, _: Response): Promise<TControllerResp<IValidationResult>> {
    log(req.body);
    const validate = Util.validateParamWithData<InAppleReceipt>({ body: req.body }, JSCPostAppleReceipt);
    if (!validate.result) {
      throw boom.badRequest(validate.errorMessage);
    }
    try {
      const vRes = await appleValidation(validate.data.body.RawReceipt['transaction-receipt']);
      log({ vRes });
      return {
        status: 200,
        payload: {
          result: IapType.getInstance().iap.isValidated(vRes),
        },
      };
    } catch (err) {
      log({ err });
      return {
        status: 200,
        payload: {
          result: false,
          error: `${err}`,
        },
      };
    }
  }

  public async validateGoogleReceipt(req: Request, _: Response): Promise<TControllerResp<IValidationResult>> {
    log(req.body);
    const validate = Util.validateParamWithData<InGoogleReceipt>({ body: req.body }, JSCPostGoogleReceipt);
    if (!validate.result) {
      throw boom.badRequest(validate.errorMessage);
    }
    const checkToken = GoogleAccessTokenHelper.getInstance().checkAccessToken();
    if (!checkToken) {
      const getToken = await GoogleAccessTokenHelper.getInstance().getAccessToken();
      log({ getToken });
      if (getToken) {
        const vIap = await GoogleAccessTokenHelper.getInstance().validateIAP({
          packageName: validate.data.body.RawReceipt.packageName,
          productId: validate.data.body.RawReceipt.productId,
          token: validate.data.body.RawReceipt.purchaseToken,
        });
        return { status: 200, payload: { result: vIap } };
      }
      return {
        status: 200,
        payload: {
          result: false,
        },
      };
    }

    const vIap1 = await GoogleAccessTokenHelper.getInstance().validateIAP({
      packageName: validate.data.body.RawReceipt.packageName,
      productId: validate.data.body.RawReceipt.productId,
      token: validate.data.body.RawReceipt.purchaseToken,
    });
    return { status: 200, payload: { result: vIap1 } };
  }
}
