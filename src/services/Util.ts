import * as Ajv from 'ajv';
import * as debug from 'debug';

const log = debug('InApp:Util');

export class Util {
  /** JSC로 validate 한 뒤 타입에 따라 변환된 데이터를 반환한다. */
  public static validateParamWithData<T>(
    param: T,
    schema: object,
  ): {
    result: boolean;
    data: T;
    errorMessage?: string;
  } {
    try {
      const ajv = new Ajv({
        coerceTypes: true,
        useDefaults: true,
      });
      const validate = ajv.compile(schema);
      const data = param;
      const valid = validate(data);
      if (valid === false) {
        log(validate.errors);
      }
      const result = typeof valid === 'boolean' ? valid : false;
      return {
        result,
        data,
        errorMessage: typeof valid === 'boolean' && !valid && !!validate.errors ? validate.errors[0].message : '',
      };
    } catch (err) {
      log(err);
      return {
        result: false,
        data: param,
        errorMessage: 'catch validate error',
      };
    }
  }
}
