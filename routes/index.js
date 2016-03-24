'use strict';

const express = require('express');
const router = express.Router();

const request = require('request');
const readline = require('readline');
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const iap = require('in-app-purchase');

iap.config({applePassword:""});

iap.setup(function (err) {
    if (err) {
        return console.error('something went wrong...');
    }
    else {
        console.log('iap init done');
    }
});

/* POST validation ios */
router.post('/appleiap/receipt/validation', function(req, res, next) {

    let parseRawRecipt = JSON.parse(req.body.RawReceipt);
    
    if(req.body.RawReceipt === null 
      || req.body.RawReceipt === undefined) {
        res.send({result:false});
        return;
    }
    
    if(parseRawRecipt['transaction-receipt'] === undefined) {
        res.send(
            {result:false, 
            error:'receipt invalid transaction receipt'});
    }

    iap.validate(
        iap.APPLE, 
        parseRawRecipt['transaction-receipt'], 
        function (err, appleRes) {
                
            //에러 발생시 에러 전달
            if (err) {
                res.send({result:false, error:`${err}`});
                return;
            }
            //검증되었는지 확인
            if (iap.isValidated(appleRes)) {
                res.send({result:true});
            }
            else {
                res.send({result:false});
            }
        });
});

const client_id = process.env.clientid || '앞에서 얻은 CLIENT_ID';
const client_secret = process.env.clientsecret || '앞에서 얻은 CLIENT_SECRET';
const redirect_uri = process.env.redirecturi || 'url';

//구글 API 중 접근해야할 곳을 다수로 요청할 수 있다.
const scopes = ['https://www.googleapis.com/auth/androidpublisher'];

router.get('/googleiab/token/request', function (req, res) {
    let oauth2Client = new OAuth2(client_id, client_secret, redirect_uri);
    let url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online'이 기본인데 refresh_token을 얻으러면 'offline'으로 입력
        scope: scopes, // string으로된 Array 형태의 scope
        approval_prompt: 'force'
    });
    console.log(url);
    res.redirect(url);
});

var tokenStorage = {
    access_token: null,
    token_type: null,
    expires_in: null,
    refresh_token: null
};

let repeat_refresh = null; //setInterval 설정이 저장될 변수 
const min30 = 30*60*1000; //30분

function RefreshIABTokenInterval() {
    let url = 'https://www.googleapis.com/oauth2/v4/token';
    let payload = {
        refresh_token: tokenStorage.refresh_token,
        grant_type: 'refresh_token',
        client_id: client_id,
        client_secret: client_secret
    };

    request.post(url, { form: payload }, function (error, response, body) {
        if(error) {
            repeat_refresh = null;
            clearInterval(repeat_refresh);
            return;
        }

        let parseBody = JSON.parse(body);
        tokenStorage.access_token = parseBody.access_token;
        tokenStorage.token_type = parseBody.token_type;
        tokenStorage.expires_in = parseBody.expires_in;
    });
}

router.get('/googleiab/token/redirect', function (req, res) {
    //토큰을 요청하여 redirect되면 authorization code를 포함한다.
    //code 유무를 확인.
    if( (req.query.code === null || req.query.code === undefined)) {
        res.send(tokenStorage);
        return;    
    }
    
    //authorization code를 포함하면 access token과 교환할 수 있도록 한다.
    let url = 'https://www.googleapis.com/oauth2/v4/token';
    let payload = {
        grant_type: 'authorization_code',//OAuth 2.0 스펙에 포함된 필드로 반드시 'authorization_code'로 입력한다. 
        code: req.query.code, //토큰 요청을 통해서 얻은 코드
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect_uri
    };

    request.post(url, { form: payload }, function (error, response, body) {

        let parseBody = JSON.parse(body);
        tokenStorage.access_token = parseBody.access_token;
        tokenStorage.token_type = parseBody.token_type;
        tokenStorage.expires_in = parseBody.expires_in;
        tokenStorage.refresh_token = parseBody.refresh_token;

        //refresh_token으로 1시간이 되기 전에 access token으로 교환되도록 한다.
        if(repeat_refresh === null) {
            repeat_refresh = setInterval(RefreshIABTokenInterval, min30);
        }
        
        res.send(tokenStorage);
    });
});

router.post('/googleiab/receipt/validation', function(req, res) {
    //req.body.RawReceipt //JSON format Receipt
    
    if(req.body.RawReceipt === null || req.body.RawReceipt === undefined) {
        res.send({result:false});
        return;
    }
    
    let parseRawRecipt = JSON.parse(req.body.RawReceipt);
    let packageName = parseRawRecipt.packageName;
    let productId = parseRawRecipt.productId;
    let token = parseRawRecipt.purchaseToken;
    
    function ValidationIAB() {
        return new Promise(function(resolve, reject) {
            let getUrl = `https://www.googleapis.com/androidpublisher/v2/applications/${packageName}/purchases/products/${productId}/tokens/${token}?access_token=${tokenStorage.access_token}`;

            request.get(getUrl, function (error, response, body) {
        
                let parseBody = JSON.parse(body);
                if (!(parseBody.error === null || parseBody.error === undefined)) {
                    reject(false);
                }
                else if(parseBody.purchaseState === 0) {
                    resolve(true);
                }
                else {
                    reject(false);
                }
            });
        });
        
    }
    
    ValidationIAB()
    .catch(function() {
        return new Promise(function(resolve, reject) {
            resolve(false);
        });
    })
    .then(function(code) {
        res.send({result:code});
    });
});

module.exports = router;