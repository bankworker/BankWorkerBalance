let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

router.get('/branchSetting', function(req, res, next) {
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

router.put('/changePassword', function (req, res, next) {
  let service = new commonService.commonInvoke('changePassword');

  let data = {
    account: req.body.account,
    bankCode: req.body.bankCode,
    branchCode: req.body.branchCode,
    systemID: '2',
    password: req.body.password,
    loginUser: req.body.loginUser
  };

  service.change(data, function (result) {
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

router.put('/changeBusinessStatus', function (req, res, next) {
  let service = new commonService.commonInvoke('changeBusinessStatus');
  let data = {
    businessID: req.body.businessID,
    businessStatus: req.body.businessStatus,
    loginUser: req.body.loginUser
  };

  service.change(data, function (result) {
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

router.put('/changeBusinessComplete', function (req, res, next) {
  let service = new commonService.commonInvoke('complete');
  let data = {
    businessID: req.body.businessID,
    businessStatus: req.body.businessStatus,
    loginUser: req.body.loginUser
  };

  service.change(data, function (result) {
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

module.exports = router;