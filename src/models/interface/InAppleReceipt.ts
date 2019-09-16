import { AppleReceipt } from 'in-app-purchase';

export interface InAppleReceipt {
  body: {
    RawReceipt: {
      'transaction-receipt': AppleReceipt;
    };
  };
}
