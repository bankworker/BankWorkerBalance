$(document).ready(function () {
  $('#btnChangePassword').click(function () {
    let bankCode = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_BANKCODE);
    let branchCode = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_BRANCHCODE);
    let cellphone = $('#hidden-account').val();
    let postID = $('#hidden-postID').val();
    let oldPassword = $.trim($('#oldPassword').val());
    let newPassword = $.trim($('#newPassword').val());
    let confirmPassword = $.trim($('#confirmPassword').val());

    $('#error-message-confirmPassword').hide();
    if(oldPassword.length === 0 || newPassword.length === 0 || confirmPassword.length === 0){
      return false;
    }
    if(newPassword !== confirmPassword){
      $('#error-message-confirmPassword').show();
      return false;
    }

    $('#oldPassword').val('');
    $('#newPassword').val('');
    $('#confirmPassword').val('');

    $.ajax({
      url: '/login',
      type: 'POST',
      dataType: 'json',
      data:{
        bankCode: bankCode,
        branchCode: branchCode,
        postID: postID,
        cellphone: cellphone,
        password: oldPassword,
      },
      success: function(res){
        if(res.err){
          $('#dialog-changePassword').modal('hide');
          bootbox.alert('服务器处理异常，请稍后再试。');
          return false;
        }
        if(res.userInfo === null){
          $('#dialog-changePassword').modal('hide');
          bootbox.alert('原密码输入错误。');
          return false;
        }

        $.ajax({
          url: '/common/changePassword',
          type: 'PUT',
          dataType: 'json',
          data:{
            bankCode: bankCode,
            branchCode: branchCode,
            account: cellphone,
            password: newPassword,
            loginUser: commonUtility.getLoginUser()
          },
          success: function(res){
            if(res.err){
              $('#dialog-changePassword').modal('hide');
              bootbox.alert('服务器处理异常，密码修改失败，请稍后再试。');
              return false;
            }
            $('#dialog-changePassword').modal('hide');
            bootbox.alert('密码修改成功！');
          },
          error: function(XMLHttpRequest, textStatus){
            bootbox.alert('无法连接远程服务器，请检查网络设置。');
          }
        });
      },
      error: function(XMLHttpRequest, textStatus){
        bootbox.alert('无法连接远程服务器，请检查网络设置。');
      }
    });
  });

  $('#btnSignOut').click(function () {
    commonUtility.delCookie(commonUtility.COOKIE_LOGIN_USER);
    commonUtility.delCookie(commonUtility.COOKIE_LOGIN_USERID);
    location.href = '/';
  });
});