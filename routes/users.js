'use strict';

const express = require('express');
const router = express.Router();

const request = require('request');
const google = require('googleapis');

const SERVICE_ACCOUNT_KEY_FILE = './key.json';
var tokenStorage = {
    access_token: null,
    token_type: null,
    expiry_date: null
};

//access_token을 확인한다.
function CheckAccessToken() {
    return new Promise(function (resolve, reject) {
        let nowTime = new Date().getTime();
        //access_token 유무 확인
        if (tokenStorage.access_token === null) {
            reject();
        }
        //access_token의 유효기간이 끝났는지 확인
        else if (tokenStorage.expiry_date < nowTime) {
            reject();
        }
        else {
            resolve();
        }
    });
}

//JWT를 활용하여 access_token을 획득한다.
function GetAccessToken() {
    return new Promise(function (resolve, reject) {

        let jwt = new google.auth.JWT(
            null,
            SERVICE_ACCOUNT_KEY_FILE, //키 파일의 위치
            null,
            ['https://www.googleapis.com/auth/androidpublisher'], //scope
            ''
            );

        jwt.authorize(function (err, tokens) {
            if (err) {
                reject(err)
                return;
            }
            tokenStorage.access_token = tokens.access_token;
            tokenStorage.token_type = tokens.token_type;
            tokenStorage.expiry_date = tokens.expiry_date;
            resolve();
        });
    });
}

function ValidationIAB(packageName, productId, token) {
    return new Promise(function (resolve, reject) {
        let getUrl = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${token}?access_token=${tokenStorage.access_token}`;

        request.get(getUrl, function (error, response, body) {

            let parseBody = JSON.parse(body);
            if (!(parseBody.error === null || parseBody.error === undefined)) {
                reject(false);
            }
            else if (parseBody.purchaseState === 0) {
                resolve(true);
            }
            else {
                reject(false);
            }
        });
    });
}

router.post('/googleiab/receipt/validation', function(req, res, next) {
    if(req.body.RawReceipt === null || req.body.RawReceipt === undefined) {
        res.send({result:false});
        return;
    }
    
    let parseRawRecipt = JSON.parse(req.body.RawReceipt);
    let packageName = parseRawRecipt.packageName;
    let productId = parseRawRecipt.productId;
    let token = parseRawRecipt.purchaseToken;
    
    
    CheckAccessToken()
    .catch(GetAccessToken)
    .then(function() {
        return ValidationIAB(packageName, productId, token);
    })
    .catch(function(err) {
        return new Promise(function(resolve, reject) {
            resolve(err);
        });
    })
    .then(function(code) {
        res.send({result:code});
    });
});

module.exports = router;
