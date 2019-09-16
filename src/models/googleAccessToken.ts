import axios, { AxiosResponse } from 'axios';
import * as debug from 'debug';
import { JWT } from 'google-auth-library';

const SERVICE_ACCOUNT_KEY_FILE = './key.json';

const log = debug('InApp:GoogleAccessTokenHelper');

export class GoogleAccessTokenHelper {
  public static instance: GoogleAccessTokenHelper;

  // tslint:disable-next-line: variable-name
  private access_token: string | null = null;
  // tslint:disable-next-line: variable-name
  private expiry_date: number | null = null;

  public static getInstance() {
    if (!GoogleAccessTokenHelper.instance) {
      GoogleAccessTokenHelper.instance = new GoogleAccessTokenHelper();
    }
    return GoogleAccessTokenHelper.instance;
  }

  public checkAccessToken() {
    const nowTime = new Date().getTime();
    if (this.access_token === null) {
      return false;
    }
    if (this.expiry_date === null) {
      return false;
    }
    return this.expiry_date < nowTime;
  }

  public async getAccessToken() {
    const jwt = new JWT({
      keyFile: SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    try {
      const result = await jwt.authorize();
      log({ result });
      if (result.access_token && result.token_type && result.expiry_date) {
        this.access_token = result.access_token;
        this.expiry_date = result.expiry_date;
        return true;
      }
      return false;
    } catch (err) {
      log({ err });
      return false;
    }
  }

  public async validateIAP({
    packageName,
    productId,
    token,
  }: {
    packageName: string;
    productId: string;
    token: string;
  }) {
    // tslint:disable-next-line: max-line-length
    const getUrl = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${token}?access_token=${
      this.access_token
    }`;
    const result: AxiosResponse<{ purchaseState?: number }> = await axios(getUrl);
    log(result.data);
    if (result.status === 200 && result.data) {
      return result.data.purchaseState === 0;
    }
    return false;
  }
}
