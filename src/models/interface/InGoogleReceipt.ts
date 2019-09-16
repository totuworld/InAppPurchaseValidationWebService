export interface InGoogleReceipt {
  body: {
    RawReceipt: {
      packageName: string;
      productId: string;
      purchaseToken: string;
    };
  };
}
