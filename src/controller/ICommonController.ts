import { EN_REQUEST_RESULT } from 'routes/CommonRoute';

/**
 * 요청 실패시 출력되는 에러에 대한 타입 정의
 * AxiosError일 경우 status code 표시
 * 이외의 에러는 어떤 형식으로 들어올 지 모르니 data 속성에 넣어서 전달
 */
export interface IRequesterError {
  errorType: ENREQUEST_ERRORS;
  statusCode?: number;
  data: any;
}

export declare enum ENREQUEST_ERRORS {
  AXIOS = 'AXIOS',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export type TResp<E, P> = {
  status: number;
  type: EN_REQUEST_RESULT;
  error?: E;
  payload?: P;
};

export type TErrorResp = {
  status?: number;
  code: string;
  message: string;
};

export type TControllerResp<T> = Express.Response | TResp<IRequesterError, T> | void;
