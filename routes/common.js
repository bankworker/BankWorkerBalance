let express = require('express');
let router = express.Router();
let commonService = require('../service/commonService');

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