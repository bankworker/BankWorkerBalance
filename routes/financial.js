let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('financial', { title: '理财经理业务主页' });
});

router.get('/clockInfo', function(req, res, next) {
  let service = new commonService.commonInvoke('clockInfo');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let staffID = req.query.staffID;
  let parameter = '/' + bankCode + '/' + branchCode + '/' + staffID;
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
        clockInfo: result.content.responseData
      });
    }
  });
});

router.post('/clockInfo', function (req, res, next) {
  let service = new commonService.commonInvoke('clockInfo');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    staffID: req.body.staffID,
    clockStatus: req.body.clockStatus,
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
        msg: result.content.responseMessage
      });
    }
  });
});

router.get('/business', function(req, res, next) {
  let service = new commonService.commonInvoke('financialBusiness');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let receiverID = req.query.receiverID;
  let parameter = '/' + bankCode + '/' + branchCode + '/' + receiverID;

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

router.get('/newBusiness', function(req, res, next) {
  let service = new commonService.commonInvoke('newBusiness');
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
        businessInfo: result.content.responseData
      });
    }
  });
});

router.put('/changeBusinessStatus', function (req, res, next) {
  let service = new commonService.commonInvoke('changeBusinessStatus');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    businessID: req.body.businessID,
    businessStatus: req.body.businessStatus,
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

router.get('/callback', function(req, res, next) {
  let service = new commonService.commonInvoke('callBack');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let parameter = '/1/999/' + bankCode + '/' + branchCode;
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
        callBackList: result.content.responseData
      });
    }
  });
});

router.put('/sendCallback', function (req, res, next) {
  let service = new commonService.commonInvoke('sendCallBack');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    businessID: req.body.businessID,
    businessStatus: req.body.businessStatus,
    callbackID: req.body.callbackID,
    loginUser: req.body.loginUser
  };

  service.change(data, function (result) {
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
      });
    }
  });
});

router.get('/hurryUp', function(req, res, next) {
  let service = new commonService.commonInvoke('hurryUp');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  let receiverID = req.query.receiverID;
  let parameter = '/' + bankCode + '/' + branchCode + '/' + receiverID;

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
        hurryUpInfo: result.content.responseData
      });
    }
  });
});

router.put('/hurryUp', function (req, res, next) {
  let service = new commonService.commonInvoke('hurryUp');
  let data = {
    bankCode: req.cookies.bwbBankCode,
    branchCode: req.cookies.bwbBranchCode,
    businessID: req.body.businessID,
    receiverID: req.body.receiverID,
    hurryUpStatus: 'C',
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
        msg: result.content.responseMessage,
      });
    }
  });
});

module.exports = router;