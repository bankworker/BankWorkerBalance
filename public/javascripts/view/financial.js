let app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
  $scope.model = {
    currentBusinessID: 0,
    staffID: 0,
    staffPhotoUrl: '',
    staffName: '',
    currentStatus: '',
    currentStatusText: '',
    switchButtonText: '',
    isShowOptionButtons: false,
    dataList: [],
    newBusiness: {
      businessID: 0,
      senderID: 0,
      senderPhoto: '',
      senderName: '',
      sendTime: ''
    },
    callBack:{
      currentCallBackID: 0,
      dataList: []
    },
    hurryUp:{
      businessID: 0,
      senderID: 0,
      senderPhoto: '',
      senderName: '',
      sendTime: ''
    },
    intervalObj: {},
    intervalSeconds: 20000
  };

  // region 页面初始化数据加载
  $scope.initProcess = function () {
    $scope.checkIsFinancial();
    $scope.loadBranchSetting();
    $scope.loadFinancialInfo();
    $scope.loadCurrentStatus();
    $scope.loadCallBackData();
    $scope.loadBusinessData();
    $scope.receiveCurrentNewBusiness();
    $scope.receiveHurryUp();
  };

  $scope.checkIsFinancial = function(){
    let cookieValue = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_USER);
    let lobbyInfo = JSON.parse(cookieValue);

    if(lobbyInfo.staffPostName === '大堂经理'){
      location.href = '/';
      return false;
    }
  };

  $scope.loadBranchSetting = function(){
    commonUtility.loadBranchSetting();
  };

  $scope.loadFinancialInfo = function(){
    let cookieValue = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_USER);
    let financialInfo = JSON.parse(cookieValue);
    $scope.model.staffPhotoUrl = financialInfo.staffPhotoUrl;
    $scope.model.staffID = financialInfo.staffID;
    $scope.model.staffName = financialInfo.staffName;
    $('.options-bar img').attr('src', financialInfo.staffPhotoUrl);
    $('#hidden-account').val(financialInfo.account);
    $('#hidden-postID').val(financialInfo.staffPostID);
  };

  $scope.loadCurrentStatus = function(){
    $http.get('/financial/clockInfo?staffID=' + $scope.model.staffID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('系统异常，请稍后再试！');
        return false;
      }
      if(response.data.clockInfo === null){
        $scope.model.currentStatus = ClockStatusConstant.OFF_DUTY; //当前状态为离岗
        $scope.model.currentStatusText = '离岗'; //当前状态为离岗
        $scope.model.switchButtonText = '到岗'; //切换按钮应显示到岗
        $scope.model.isShowOptionButtons = false; //不显示相关操作
        $scope.stopMonitor();
        return false;
      }
      if(response.data.clockInfo.clockStatus === ClockStatusConstant.OFF_DUTY){ //离岗
        $scope.model.currentStatus = response.data.clockInfo.clockStatus; //当前状态为离岗
        $scope.model.currentStatusText = response.data.clockInfo.clockStatusText; //当前状态为离岗
        $scope.model.switchButtonText = '到岗'; //切换按钮应显示到岗
        $scope.model.isShowOptionButtons = false; //不显示相关操作
        $scope.stopMonitor();
      }else{
        $scope.model.currentStatus = response.data.clockInfo.clockStatus; //当前状态为离岗
        $scope.model.currentStatusText = response.data.clockInfo.clockStatusText; //当前状态为离岗
        $scope.model.switchButtonText = '离岗'; //切换按钮应显示到岗
        $scope.model.isShowOptionButtons = true; //不显示相关操作
        $scope.startMonitor();
        $scope.monitor();
      }
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请稍后再试！');
    });
  };

  $scope.loadBusinessData = function(userInfo){
    $http.get('/financial/business?receiverID=' + $scope.model.staffID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      $scope.model.dataList = response.data.businessList;
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.receiveCurrentNewBusiness = function(){
    $http.get('/financial/newBusiness?senderID=' + $scope.model.staffID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('接收最新业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      if(response.data.businessInfo === null){
        $scope.model.newBusiness.senderID = 0;
        $scope.model.newBusiness.senderName = '';
        $scope.model.newBusiness.senderPhoto = '';
        $scope.model.newBusiness.sendTime = '';
        return false;
      }

      $scope.model.newBusiness.businessID = response.data.businessInfo.businessID;
      $scope.model.newBusiness.senderID = response.data.businessInfo.senderID;
      $scope.model.newBusiness.senderName = response.data.businessInfo.senderName;
      $scope.model.newBusiness.senderPhoto = response.data.businessInfo.senderPhoto;
      $scope.model.newBusiness.sendTime = response.data.businessInfo.sendTime;
      $('#dialog-newBusiness').modal('show');
      $scope.playVoice('alterAudio');
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };
  // endregion

  // region 页面顶部操
  $scope.onSwitch = function(){
    if($scope.model.currentStatus === ClockStatusConstant.OFF_DUTY){
      $scope.switch();
    }else{
      bootbox.confirm({
        message: '您确认现在离岗吗？',
        buttons: {
          confirm: {
            label: '离岗',
            className: 'btn-danger'
          },
          cancel: {
            label: '取消',
            className: 'btn-default'
          }
        },
        callback: function (result) {
          if(result) {
            $scope.switch();
          }
        }
      });
    }
  };

  $scope.switch = function(){
    if($scope.model.currentStatus === ClockStatusConstant.OFF_DUTY){
      //当前为"离岗"状态，应切换为"到岗"状态
      $scope.model.currentStatus = ClockStatusConstant.DUTY;
      $scope.model.currentStatusText = '到岗';
      $scope.model.switchButtonText = '离岗';
      $scope.model.isShowOptionButtons = true;
      $scope.addClockInfo();
      this.monitor();
      this.startMonitor();
    }else{
      //当前至少为为"到岗"状态,应切换到"离岗"状态
      $scope.model.currentStatus = ClockStatusConstant.OFF_DUTY;
      $scope.model.currentStatusText = '离岗';
      $scope.model.switchButtonText = '到岗';
      $scope.model.isShowOptionButtons = false;
      this.addClockInfo();
      this.stopMonitor();
    }
  };

  $scope.onWaiting = function(){
    if($scope.model.currentStatus === ClockStatusConstant.FREE){
      return false;
    }
    $scope.model.currentStatus = ClockStatusConstant.FREE;
    $scope.model.currentStatusText = '等待';
    $scope.addClockInfo();
  };

  $scope.onBusy = function(){
    if($scope.model.currentStatus === ClockStatusConstant.BUSY){
      return false;
    }
    $scope.model.currentStatus = ClockStatusConstant.BUSY;
    $scope.model.currentStatusText = '繁忙';
    $scope.addClockInfo();
  };

  $scope.onLeave = function(){
    if($scope.model.currentStatus === ClockStatusConstant.LEAVE){
      return false;
    }
    $scope.model.currentStatus = ClockStatusConstant.LEAVE;
    $scope.model.currentStatusText = '离开';
    $scope.addClockInfo();
  };

  $scope.addClockInfo = function(){
    $http.post('/financial/clockInfo', {
      staffID:  $scope.model.staffID,
      clockStatus: $scope.model.currentStatus,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('系统异常，请稍后再试。');
        return false;
      }
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请稍后再试。');
    });
  };
  // endregion

  // region 新业务回复
  $scope.onAccept = function(){
    //更新业务状态为
    $scope.changeBusinessStatus($scope.model.newBusiness.businessID, BusinessStatusConstant.ACCEPT);

    //更新工作状态
    $scope.model.currentStatus = ClockStatusConstant.BUSY;
    $scope.model.currentStatusText = '繁忙';
    $scope.addClockInfo();

    //关闭提醒
    $('#dialog-newBusiness').modal('hide');
    $scope.stopVoice('alterAudio');
  };

  $scope.onReject = function(){
    //更新业务状态为
    $scope.changeBusinessStatus($scope.model.newBusiness.businessID, BusinessStatusConstant.REJECT);

    //关闭提醒
    $('#dialog-newBusiness').modal('hide');
    $scope.stopVoice('alterAudio');
  };
  // endregion

  // region 业务办理相关操作
  $scope.onComplete = function(businessID){
    bootbox.confirm({
      message: '确认该笔业务已完结',
      buttons: {
        confirm: {
          label: '完结',
          className: 'btn-success'
        },
        cancel: {
          label: '取消',
          className: 'btn-default'
        }
      },
      callback: function (result) {
        if(result) {
          //更新业务状态为
          $scope.changeBusinessComplete(businessID);
          //更新工作状态
          $scope.model.currentStatus = ClockStatusConstant.FREE;
          $scope.model.currentStatusText = '等待';
          $scope.addClockInfo();
        }
      }
    });
  };

  $scope.onShowCallBack = function(businessID){
    $scope.model.currentBusinessID = businessID;
    $('#dialog-callBack').modal('show');
  };

  $scope.onChooseCallBack = function(callbackID){
    $scope.model.callBack.currentCallBackID = callbackID;
  };

  $scope.onSendCallBack = function(){
    $http.put('/financial/sendCallback', {
      businessID: $scope.model.currentBusinessID,
      businessStatus: BusinessStatusConstant.CALLBACK,
      callbackID: $scope.model.callBack.currentCallBackID,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response){
      if(response.data.err){
        bootbox.alert('发送回呼消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }

      //更新工作状态
      $scope.model.currentStatus = ClockStatusConstant.FREE;
      $scope.model.currentStatusText = '等待';
      $scope.addClockInfo();

      //刷新数据
      $scope.loadBusinessData();

      //关闭对话框
      $('#dialog-callBack').modal('hide');
    }, function errorCallback(response){
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.loadCallBackData = function(){
    $http.get('/financial/callback').then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取回呼内容失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      if(response.data.callBackList === null){
        return false;
      }
      $scope.model.callBack.dataList = response.data.callBackList;
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.changeBusinessComplete = function(businessID){
    $http.put('/financial/completeBusiness', {
      businessID: businessID,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response){
      if(response.data.err){
        bootbox.alert('更新业务状态失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      $scope.loadBusinessData();
    }, function errorCallback(response){
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  // endregion

  // region 业务催促
  $scope.receiveHurryUp = function(){
    $http.get('/financial/hurryUp?receiverID=' + $scope.model.staffID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('接收催促消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      if(response.data.hurryUpInfo === null){
        return false;
      }
      $scope.model.hurryUp.businessID = response.data.hurryUpInfo.businessID;
      $scope.model.hurryUp.senderID = response.data.hurryUpInfo.senderID;
      $scope.model.hurryUp.senderPhoto = response.data.hurryUpInfo.senderPhoto;
      $scope.model.hurryUp.senderName = response.data.hurryUpInfo.senderName;
      $scope.model.hurryUp.sendTime = response.data.hurryUpInfo.createTime;

      $scope.playVoice('hurryAudio');
      $('#dialog-hurry-up').modal('show');
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.onKnow = function(businessID){
    $http.put('/financial/hurryUp', {
      businessID: businessID,
      receiverID: $scope.model.staffID,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response){
      if(response.data.err){
        bootbox.alert('更新催促状态，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
    }, function errorCallback(response){
      bootbox.alert('网络异常，请检查网络设置。');
    });

    //停止播放提醒音
    $scope.stopVoice('hurryAudio');

    //关闭提醒框
    $('#dialog-hurry-up').modal('hide');
  };
  // endregion

  // region 公共方法
  $scope.changeBusinessStatus = function(businessID, status){
    $http.put('/financial/changeBusinessStatus', {
      businessID: businessID,
      businessStatus: status,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response){
      if(response.data.err){
        bootbox.alert('更新业务状态失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      $scope.loadBusinessData();
    }, function errorCallback(response){
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.playVoice = function(elementID){
    let audio = document.getElementById(elementID);
    if(audio !== null && audio.paused){
      audio.play();
    }
  };

  $scope.stopVoice = function(elementID){
    let audio = document.getElementById(elementID);
    if(audio !== null && !audio.paused){
      audio.pause();
    }
  };

  $scope.startMonitor = function(){
    $scope.model.intervalObj = setInterval($scope.monitor, $scope.model.intervalSeconds);
  };

  $scope.stopMonitor = function(){
    $scope.clearData();
    clearInterval($scope.model.intervalObj);
  };

  $scope.monitor = function(){
    $scope.loadBusinessData();
    $scope.receiveCurrentNewBusiness();
    $scope.receiveHurryUp();
  };

  $scope.clearData = function(){
    if($scope.model.dataList === null){
      return false;
    }
    $scope.model.dataList.splice(0, $scope.model.dataList.length);
  };
  // endregion

  $scope.initProcess();
});