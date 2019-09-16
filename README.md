# 인앱 영수증 결제 검증 웹 서비스

_간단한 구글, 애플 인앱결제 영수증 검증_

## 개발 방법
* nodejs 10.16 인스톨
* google 영수증 검증을 위해서 key.json 파일을 root 경로에 추가해야함
  * key.json은 https://blog.totu.dev/2016/02/12/jwt/ 글을 참고 하여 취득한다.

### 개발 모드 시작

```bash
$ npm run dev
```

./src 폴더 내의 *.ts 파일에 변화가 생기면 서버가 재시작된다.

## 배포
packing 스크립트를 실행한 뒤 aws beanstalk 환경에 해당 파일을 업로드한다.
```bash
$ npm run packing
```

## 사용방법

uri의 `[hostname]`부분을 자신의 주소로 치환하여 요청한다.
> 단, 꼭 RawReceipt를 body에 함께 요청해야한다.

### 구글 인앱 영수증 요청
POST [hostname]/validation/iap/google/validation

#### body 포함 내용
* RawReceipt : json 형식으로 작성된 영수증

구글 RawReceipt 예시

```json
{ 
   "orderId":"12999763169054705758.1371079406387615", 
   "packageName":"com.example.app",
   "productId":"exampleSku",
   "purchaseTime":1345678900000,
   "purchaseState":0,
   "developerPayload":"bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ",
   "purchaseToken":"rojeslcdyyiapnqcynkjyyjh"
 }
``` 


### 애플 인앱영수증 요청
POST [hostname]//validation/iap/apple/validation

#### body 포함 내용
* RawReceipt : json 형식으로 작성된 영수증

애플 RawReceipt 예시

```json
{
    "verification-state": 0,
    "transaction-receipt": "MIISiAYJKoZIh=",
    "product-identifier": "yoyo",
    "transaction-identifier": "8FXXX",
    "quantity": 1,
    "transaction-state": 1,
    "error": ""
}
```