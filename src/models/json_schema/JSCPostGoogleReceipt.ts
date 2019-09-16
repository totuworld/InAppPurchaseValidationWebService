import JSONSchemaType from './JSONSchemaType';

const JSCPostGoogleReceipt: JSONSchemaType = {
  description: '구글 iab 영수증',
  properties: {
    body: {
      properties: {
        RawReceipt: {
          properties: {
            packageName: {
              type: 'string',
            },
            productId: {
              type: 'string',
            },
            purchaseToken: {
              type: 'string',
            },
          },
          required: ['packageName', 'productId', 'purchaseToken'],
        },
      },
      required: ['RawReceipt'],
    },
  },
  required: ['body'],
};

export default JSCPostGoogleReceipt;
