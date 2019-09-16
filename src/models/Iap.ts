import * as debug from 'debug';
import * as iap from 'in-app-purchase';

const log = debug('InApp:Iap');

export class IapType {
  public static instance: IapType;
  public static getInstance() {
    if (!IapType.instance) {
      IapType.instance = new IapType();
    }
    return IapType.instance;
  }
  constructor() {
    iap.config({ applePassword: '' });
    iap.setup((err) => {
      if (err) {
        return log('something went wrong...');
      }
      log('iap init done');
    });
  }
  get iap() {
    return iap;
  }
}
