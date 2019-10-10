let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('login', { title: '系统登陆', layout: null });
});

router.get('/backImageSetting', function(req, res, next) {
  let service = new commonService.commonInvoke('branchInfo');
  let bankCode = req.cookies.bwbBankCode;
  let branchCode = req.cookies.bwbBranchCode;
  if(bankCode === undefined || branchCode === undefined){
    res.json({
      err: false,
      msg: 'use default setting.',
      branchInfo: null
    });
    return false;
  }

  let parameter = '/' + bankCode + '/' + branchCode;
  service.get(parameter, function (result) {
    if (result.err) {
      res.json({
        err: true,
        msg: result.msg
      });
    } else {
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        branchInfo: result.content.responseData
      });
    }
  })
});

router.get('/bankList', function(req, res, next) {
  let service = new commonService.commonInvoke('bank');
  let parameter = '/1/9999/N';

  service.get(parameter, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        bankList: result.content.responseData
      });
    }
  });
});

router.get('/branchList', function(req, res, next) {
  let service = new commonService.commonInvoke('branch');
  let bankCode = req.query.bankCode;

  service.get(bankCode, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        branchList: result.content.responseData
      });
    }
  });
});

router.get('/staffPost', function(req, res, next) {
  let service = new commonService.commonInvoke('staffPost');
  let bankCode = req.query.bankCode;
  let branchCode = req.query.branchCode;
  let parameter = '/1/9999/' + bankCode + '/' + branchCode;

  service.get(parameter, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        staffPostList: result.content.responseData
      });
    }
  });
});

router.post('/', function (req, res, next) {
  let service = new commonService.commonInvoke('login');
  let parameter = req.body.bankCode + '/' + req.body.branchCode + '/' + req.body.postID + '/' + req.body.cellphone + '/' + req.body.password;

  service.get(parameter, function (result) {
    if(result.err){
      res.json({
        err: true,
        msg: result.msg
      });
    }else{
      res.json({
        err: !result.content.result,
        msg: result.content.responseMessage,
        userInfo: result.content.responseData
      });
    }
  })
});

module.exports = router;