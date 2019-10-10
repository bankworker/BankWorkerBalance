let app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
  $scope.photo = '';
  $scope.userID = '';
  $scope.fullName = '';
  $scope.job = '';
  $scope.status = '';
  $scope.statusText = '';
  $scope.toggleText = '';
  $scope.isShowOptionButtons = false;
  $scope.dataList = [];
  $scope.modalTitle = '';
  $scope.confirmMessage = '';
  $scope.confirmType = '';
  $scope.alertMessage = '';
  $scope.intervalObj = {};
  $scope.intervalSeconds = 20000;
  $scope.currentBusinessID = '';
  $scope.sessionBusinessID = '';
  $scope.sessionPhoto = '';
  $scope.sessionFullName = '';
  $scope.sessionTime = '';
  $scope.callBackData = [];
  $scope.currentCallBackID = 1;
  $scope.isShowOtherCallBackMessage = false;
  $scope.otherCallBackMessage = '';
  $scope.callBackMessage = '';

  $scope.hurryUpSenderPhoto = '';
  $scope.hurryUpSenderName = '';
  $scope.hurryUpTime = '';

  $scope.loginUser = {};


  $scope.initProcess = function () {
    let cookieValue = common.getCookie('loginUser');
    let financialInfo = JSON.parse(cookieValue);
    //判断是否是理财经理
    if(financialInfo.userRole !== '2' && financialInfo.userRole !== '4'){
      common.delCookie('loginUser');
      location.href = '/';
      return false;
    }
    this.loginUser = financialInfo;
    $scope.loadData(financialInfo);
    $scope.loadCallBackData();

  };

  $scope.loadData = function(userInfo){
    //设置基本信息
    this.userID = userInfo.userID;
    this.photo = userInfo.userPhoto;
    this.fullName = userInfo.userName;
    this.job = userInfo.userRoleText;

    //设置工作状态
    $http.get('/financial/index/clock?userID=' + userInfo.userID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      if(response.data.clockInfo === null){
        //如果没有数据，则默认为离岗状态
        $scope.status = '4'; //当前状态为离岗
        $scope.statusText = '离岗'; //当前状态为离岗
        $scope.toggleText = '到岗'; //切换按钮应显示到岗
        $scope.isShowOptionButtons = false; //不显示相关操作
        $scope.stopMonitor();
      }else{
        if(response.data.clockInfo.clockUserStatus === '4'){ //离岗
          $scope.status = response.data.clockInfo.clockUserStatus; //当前状态为离岗
          $scope.statusText = response.data.clockInfo.clockUserStatusText; //当前状态为离岗
          $scope.toggleText = '到岗'; //切换按钮应显示到岗
          $scope.isShowOptionButtons = false; //不显示相关操作
          $scope.stopMonitor();
        }else{
          $scope.status = response.data.clockInfo.clockUserStatus; //当前状态为离岗
          $scope.statusText = response.data.clockInfo.clockUserStatusText; //当前状态为离岗
          $scope.toggleText = '离岗'; //切换按钮应显示到岗
          $scope.isShowOptionButtons = true; //不显示相关操作
          $scope.startMonitor();
          $scope.monitor();
        }
      }
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.loadCallBackData = function(){
    $http.get('/financial/index/callback').then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，无法获取回呼内容。';
        $('#dialog-message').modal('show');
        return false;
      }
      if(response.data.callBackList === null){
        $scope.alertMessage = '未设置回呼内容。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.callBackData = response.data.callBackList;
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.toggle = function(){
    if(this.status === '4'){
      //当前为"离岗"状态，应切换为"到岗"状态
      this.status = '0';
      this.statusText = '到岗';
      this.toggleText = '离岗';
      this.isShowOptionButtons = true;
      this.clock();
      this.monitor();
      this.startMonitor();
    }else{
      //当前至少为为"到岗"状态,应切换到"离岗"状态
      this.status = '4';
      this.statusText = '离岗';
      this.toggleText = '到岗';
      this.isShowOptionButtons = false;
      this.clock();
      this.stopMonitor();
    }
  };

  $scope.clock = function(){
    $http.post('/financial/index', {
      userID:  $scope.userID,
      clockStatus: $scope.status,
      loginUser: $scope.userID
    }).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.startMonitor = function(){
    this.intervalObj = setInterval($scope.monitor, this.intervalSeconds);
  };

  $scope.stopMonitor = function(){
    $scope.clearData();
    clearInterval(this.intervalObj);
  };

  $scope.monitor = function(){
    $scope.bindData();
    $scope.receiveData();
    $scope.receiveHurryUp();
  };

  $scope.bindData = function(){
    $http.get('/financial/index/business?userID=' + $scope.userID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
      }
      $scope.dataList = response.data.businessList;
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.receiveData = function(){
    $http.get('/financial/index/business/latest?userID=' + $scope.userID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
      }
      if(response.data.latestBusiness !== null && response.data.latestBusiness.length > 0){
        $scope.currentBusinessID = response.data.latestBusiness[0].businessID;
        $scope.sessionBusinessID = response.data.latestBusiness[0].businessID;
        $scope.sessionFullName = response.data.latestBusiness[0].sendUserName;
        $scope.sessionPhoto = response.data.latestBusiness[0].sendUserPhoto;
        $scope.sessionTime = response.data.latestBusiness[0].sendTime;
        $('#dialog-session').modal('show');
        $scope.playVoice('alterAudio');
      }
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.receiveHurryUp = function(){
    $http.get('/financial/index/hurryUp?receiveUserID=' + $scope.userID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，无法获取催促信息，请稍后再试。';
        $('#dialog-message').modal('show');
      }
      if(response.data.hurryUpInfo === null){
        return false;
      }
      $scope.hurryUpSenderPhoto = response.data.hurryUpInfo.sendUserPhoto;
      $scope.hurryUpSenderName = response.data.hurryUpInfo.sendUserName;
      $scope.hurryUpTime = response.data.hurryUpInfo.createTime;
      $scope.playVoice('hurryAudio');
      $('#dialog-hurry-up').modal('show');
    }, function errorCallback(response) {
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.onKnow = function(){
    //更新状态
    $http.put('/financial/index/hurryUp', {
      receiveUserID: $scope.loginUser.userID,
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response){
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
    }, function errorCallback(response){
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });

    //停止播放提醒音
    $scope.stopVoice('hurryAudio');

    //关闭提醒框
    $('#dialog-hurry-up').modal('hide');
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

  $scope.clearData = function(){
    if(this.dataList === null){
      return false;
    }
    this.dataList.splice(0, this.dataList.length);
  };

  $scope.changeBusinessStatus = function(status){
    $http.put('/common/changeBusinessStatus', {
      businessID: $scope.currentBusinessID,
      businessStatus: status,
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response){
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.bindData();
    }, function errorCallback(response){
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.changeBusinessComplete = function(){
    $http.put('/common/changeBusinessComplete', {
      businessID: $scope.currentBusinessID,
      businessStatus: '3',
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response){
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.bindData();
    }, function errorCallback(response){
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.onLogout = function(){
    common.delCookie('loginUser');
    location.href = '/';
  };

  $scope.onToggle = function(){
    if(this.status === '4'){
      //当前为离岗状态，设置为刚岗
      this.toggle();
    }else{
      //当前至少为在岗，确认是否设置为离岗
      $scope.alertConfirm('信息确认', '请确认您已下班啦？', 'off');
    }
  };

  $scope.onConfirm = function(){
    switch (this.confirmType){
      case 'off':
        //离岗
        this.toggle();
        $('#dialog-confirm').modal('hide');
        break;
      case 'done':
        //更新业务状态为"3: 完成"
        $scope.changeBusinessComplete();
        //更新工作状态
        this.status = '1';
        this.statusText = '等待';
        this.clock();
        //刷新数据
        //$scope.bindData();
        $('#dialog-confirm').modal('hide');
        break;
    }
  };

  $scope.onFree = function(){
    if(this.status === '1'){
      return false;
    }
    this.status = '1';
    this.statusText = '等待';
    this.clock();
  };

  $scope.onBusy = function(){
    if(this.status === '2'){
      return false;
    }
    this.status = '2';
    this.statusText = '繁忙';
    this.clock();
  };

  $scope.onLeave = function(){
    if(this.status === '3'){
      return false;
    }
    this.status = '3';
    this.statusText = '离开';
    this.clock();
  };

  $scope.onAccept = function(){
    //更新业务状态为"1：接单"
    $scope.changeBusinessStatus('1');

    //更新工作状态为"2：繁忙"
    this.status = '2';
    this.statusText = '繁忙';
    this.clock();

    //刷新数据
    //$scope.bindData();

    //关闭提示框
    $('#dialog-session').modal('hide');

    //关闭提醒
    $scope.stopVoice('alterAudio');
  };

  $scope.onReject = function(){
    //更新业务状态为"2：拒绝"
    $scope.changeBusinessStatus('2');

    //刷新数据
    //$scope.bindData();

    //关闭提示框
    $('#dialog-session').modal('hide');

    //关闭提醒
    $scope.stopVoice('alterAudio');
  };

  $scope.onComplete = function(businessID){
    $scope.currentBusinessID = businessID;
    $scope.alertConfirm('信息确认', '确认该笔业务已完结？', 'done');
  };

  $scope.onChooseGoBack = function(goBackID){
    $scope.currentCallBackID = goBackID;
    $scope.isShowOtherCallBackMessage = goBackID === 7;
  };

  $scope.onGoBack = function(businessID){
    $scope.currentBusinessID = businessID;
    $('#dialog-goBack').modal('show');
  };

  $scope.onSend = function(){
    if(this.currentCallBackID === 7 && $scope.otherCallBackMessage.length === 0){
      return false;
    }

    //更新业务状态为"4:回呼"
    $http.put('/financial/index/business/callback', {
      businessID: $scope.currentBusinessID,
      businessStatus: '4',
      callBackID: $scope.currentCallBackID,
      otherCallBackMsg: $scope.otherCallBackMessage,
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response){
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      //更新工作状态
      $scope.status = '1';
      $scope.statusText = '等待';
      $scope.clock();

      //刷新数据
      $scope.bindData();
    }, function errorCallback(response){
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });

    $('#dialog-goBack').modal('hide');
  };

  $scope.alertConfirm = function(title, message, confirmType){
    this.modalTitle = title;
    this.confirmMessage = message;
    this.confirmType = confirmType;
    $('#dialog-confirm').modal('show');
  };

  //$scope.initProcess();
});