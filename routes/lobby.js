let express = require('express');
let router = express.Router();
let apiConfig = require('../config/apiConfig');
let sd = require('silly-datetime');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('lobby', { title: '大堂经理业务主页' });
});

router.get('/financialLatestClock', function(req, res, next) {
  let service = new commonService.commonInvoke('clockedFinancial');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let parameter = bankCode + '/' + branchCode;

  service.get(parameter, function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage,
        financialClockList: result.content.responseData
      });
    }
  });
});

router.get('/waitBusiness', function(req, res, next) {
  let service = new commonService.commonInvoke('newBusiness');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let receiverID = req.query.receiverID;
  let parameter = bankCode + '/' + branchCode + '/' + receiverID;
  service.get(parameter, function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage,
        waitBusiness: result.content.responseData
      });
    }
  });
});

router.post('/sendBusiness', function (req, res, next) {
  let service = new commonService.commonInvoke('sendBusiness');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    senderID: req.body.senderID,
    receiverID: req.body.receiverID,
    loginUser: req.body.loginUser
  };

  service.add(data, function (result) {
    if(result.err){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage,
      });
    }
  });
});

router.get('/business', function(req, res, next) {
  let service = new commonService.commonInvoke('lobbyBusiness');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let senderID = req.query.senderID;
  let parameter = '/' + bankCode + '/' + branchCode + '/' + senderID;

  service.get(parameter, function (result) {
    if(result.err || !result.content.result){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage,
        businessList: result.content.responseData
      });
    }
  });
});

router.post('/hurryUp', function (req, res, next) {
  let service = new commonService.commonInvoke('hurryUp');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    businessID: req.body.businessID,
    senderID: req.body.senderID,
    receiverID: req.body.receiverID,
    loginUser: req.body.loginUser
  };

  service.add(data, function (result) {
    if(result.err){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage,
      });
    }
  });
});

router.put('/completeBusiness', function (req, res, next) {
  let service = new commonService.commonInvoke('completeBusiness');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    businessID: req.body.businessID,
    loginUser: req.body.loginUser
  };

  service.change(data, function (result) {
    if(result.err){
      res.json({
        err: true,
        code: result.code === '0' ? result.content.responseCode : '0',
        msg: result.code === '0' ? result.content.responseMessage : result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        code: result.content.responseCode,
        msg: result.content.responseMessage
      });
    }
  });
});

module.exports = router;