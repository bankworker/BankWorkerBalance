let commonUtility = {};
commonUtility.COOKIE_LOGIN_USER = 'bwbUser';
commonUtility.COOKIE_LOGIN_USERID = 'bwbUserID';
commonUtility.COOKIE_LOGIN_BANKCODE = 'bwbBankCode';
commonUtility.COOKIE_LOGIN_BRANCHCODE = 'bwbBranchCode';

commonUtility.getLoginUserInfo = function() {
  let cookie = this.getCookie(this.COOKIE_LOGIN_USER);
  return cookie !== null ? JSON.parse(cookie) : null;
};

commonUtility.getLoginUser = function () {
  let cookie = this.getCookie(this.COOKIE_LOGIN_USER);
  return cookie !== null ? JSON.parse(cookie).account : 'unknown';
};

commonUtility.getLoginUserID = function () {
  let cookie = this.getCookie(this.COOKIE_LOGIN_USER);
  return cookie !== null ? JSON.parse(cookie).staffID : '0';
};

commonUtility.setCookie = function (name,value) {
  let days = 30;
  let exp = new Date();
  exp.setTime(exp.getTime() + days*24*60*60*1000);
  document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
};

commonUtility.getCookie = function (name) {
  let reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  let arr = document.cookie.match(reg);
  if(arr === null){
    return null;
  }
  return unescape(arr[2]);
};

commonUtility.delCookie = function (name) {
  let exp = new Date();
  exp.setTime(exp.getTime() - 1);
  let cookieName = this.getCookie(name);
  if(cookieName !== null)
    document.cookie= name + "=" + cookieName + ";expires=" + exp.toGMTString();
};

commonUtility.loadBranchSetting = function () {
  $.ajax({
    url: '/common/branchSetting',
    type: 'get',
    success: function(res){
      if(res.err){
        layer.msg(res.msg);
        return false;
      }
      if(res.branchInfo === null){
        return false;
      }
      $('.bank-logo img').attr('src', res.branchInfo.bankLogo);
      $('.branch-logo img').attr('src', res.branchInfo.branchLogo);
      if(res.branchInfo.branchBackImage !== ''){
        $('.main-container').css('background', 'url(' + res.branchInfo.branchBackImage + ') repeat-y center center fixed')
            .css('background-size', '100%');
      }
    },
    error: function(XMLHttpRequest){
      bootbox.alert('无法连接远程服务器，请检查网络状态。');
    }
  });
};