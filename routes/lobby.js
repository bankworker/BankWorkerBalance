let express = require('express');
let router = express.Router();
let apiConfig = require('../config/apiConfig');
let sd = require('silly-datetime');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('lobby', { title: '大堂经理业务主页' });
});

router.get('/financialLatestClock', function(req, res, next) {
  let service = new commonService.commonInvoke('financialLatestClock');
  service.get('', function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        clockInfo: result.content.responseData
      });
    }
  });
});

router.get('/business', function(req, res, next) {
  let service = new commonService.commonInvoke('sendBusiness');
  service.get(req.query.userID, function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        businessList: result.content.responseData
      });
    }
  });
});

router.get('/business/wait', function(req, res, next) {
  let service = new commonService.commonInvoke('hasWaitBusiness');
  service.get(req.query.userID, function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        result: result.content.responseData
      });
    }
  });
});

router.post('/business', function (req, res, next) {
  let service = new commonService.commonInvoke('sendBusiness');
  let data = {
    sendUserID: req.body.sendUserID,
    receiveUserID: req.body.receiveUserID,
    loginUser: req.body.loginUser
  };

  service.add(data, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage
      });
    }
  });
});

router.post('/hurryUp', function (req, res, next) {
  let service = new commonService.commonInvoke('hurryUp');
  let data = {
    sendUserID: req.body.sendUserID,
    receiveUserID: req.body.receiveUserID,
    businessID: req.body.businessID,
    loginUser: req.body.loginUser
  };

  service.add(data, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage
      });
    }
  });
});

router.post('/sendNoticeSms', function (req, res, next) {
  let sender = req.body.sender;
  let sendTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
  let cellphone = req.body.cellphone;
  let loginUser = req.body.loginUser;

  let service = new commonService.commonInvoke('thirdParty');
  smsUtils.sendNotice(cellphone, sender, sendTime, function (isSend, reqContent, resContent, reqText) {
    let data = {
      thirdParty: 'aliSms',
      requestContent: reqContent,
      responseContent: resContent,
      requestResult: isSend ? 'T' : 'F',
      responseText: reqText,
      cellphone: cellphone,
      loginUser: loginUser
    };
    service.add(data, function (result) {
      if(result.err){
        res.json({
          err: true,
          code: result.code,
          msg: result.msg
        });
      }else{
        res.json({
          err: !isSend,
          code: result.content.responseCode,
          msg: result.content.responseMessage,
          data: result.content
        });
      }
    });
  });
});

module.exports = router;