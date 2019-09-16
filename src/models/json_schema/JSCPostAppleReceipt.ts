import JSONSchemaType from './JSONSchemaType';

const JSCPostAppleReceipt: JSONSchemaType = {
  description: '애플 영수증',
  properties: {
    body: {
      properties: {
        RawReceipt: {
          properties: {
            'transaction-receipt': {
              type: 'string',
            },
          },
          required: ['transaction-receipt'],
        },
      },
      required: ['RawReceipt'],
    },
  },
  required: ['body'],
};

export default JSCPostAppleReceipt;
