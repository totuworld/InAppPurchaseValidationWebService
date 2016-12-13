# 인앱 영수증 결제 검증 웹 서비스

_간단한 구글, 애플 인앱결제 영수증 검증_


## 사용방법

uri의 `[hostname]`부분을 자신의 주소로 치환하여 요청한다.
> 단, 꼭 RawReceipt를 body에 함께 요청해야한다.

### 구글 인앱 영수증 요청
POST [hostname]/googleiab/receipt/validation

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
POST [hostname]/appleiap/receipt/validation

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