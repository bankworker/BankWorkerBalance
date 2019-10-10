let app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
  $scope.financialClockList = [];
  $scope.businessList = [];
  $scope.currentReceiveUserID = '';
  $scope.currentReceiveUserName = '';
  $scope.currentBusinessID = '';
  $scope.currentResume = '';
  $scope.currentClockStatus = '';
  $scope.alertTitle = '';
  $scope.alertMessage = '';
  $scope.modalTitle = '';
  $scope.confirmMessage = '';
  $scope.filterStatus = '';
  $scope.callBackCount = 0;
  $scope.intervalObj = {};
  $scope.intervalSeconds = 20000;
  $scope.loginUser = {};

  $scope.initProcess = function () {
    let cookieValue = commonUtility.getCookie('loginUser');
    let lobbyInfo = JSON.parse(cookieValue);
    //判断是否是理财经理
    if(lobbyInfo.userRole !== '3'){
      commonUtility.delCookie('loginUser');
      location.href = '/';
      return false;
    }
    $scope.filterStatus = '';
    $scope.loginUser = lobbyInfo;
    $scope.loadFinancialClock();
    $scope.loadBusinessData();
    $scope.startMonitor();
  };

  $scope.loadFinancialClock = function(){
    $http.get('/lobby/index/financialLatestClock').then(function successCallback(response) {
      if(response.data.err){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.financialClockList = response.data.clockInfo;
    }, function errorCallback(response) {
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.loadBusinessData = function(){
    $http.get('/lobby/index/business?userID=' + $scope.loginUser.userID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
      }
      $scope.callBackCount = 0;
      if($scope.filterStatus === ''){
        angular.forEach(response.data.businessList,function(business,index){
          if(business.businessStatus === '4'){
            $scope.callBackCount++;
          }
        });
        $scope.businessList = response.data.businessList;
      }else{
        let filterData = [];
        $scope.businessList.splice(0, $scope.businessList.length);
        angular.forEach(response.data.businessList,function(business,index){
          if(business.businessStatus === '4'){
            $scope.callBackCount++;
          }
          if(business.businessStatus === $scope.filterStatus){
            filterData.push(business);
          }
        });
        $scope.businessList = filterData;
      }
    }, function errorCallback(response) {
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.startMonitor = function(){
    this.intervalObj = setInterval($scope.monitor, $scope.intervalSeconds);
  };

  $scope.monitor = function(){
    $scope.loadFinancialClock();
    $scope.loadBusinessData();
  };

  $scope.onFilter = function(status){
    $scope.filterStatus = status;
    $scope.loadBusinessData();
  };

  $scope.onHurry = function(sendUserID, receiveUserID, businessID){
    //发送催促消息
    $http.post('/lobby/index/hurryUp', {
      sendUserID: sendUserID,
      receiveUserID: receiveUserID,
      businessID:  businessID,
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，无法发送催促提醒，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '催促提醒已发送。';
      $('#dialog-message').modal('show');
    }, function errorCallback(response) {
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.onGoBack = function(callBackID, callBackMsg, otherCallBackMsg){
    $scope.alertTitle = '回呼信息';
    if(callBackID !== 7){
      $scope.alertMessage = callBackMsg;
    }else{
      $scope.alertMessage = otherCallBackMsg;
    }

    $('#dialog-message').modal('show');
  };

  $scope.onComplete = function(businessID){
    $scope.currentBusinessID = businessID;
    $scope.alertConfirm('信息确认', '确认该笔业务已完结？', 'done');
  };

  $scope.onConfirm = function(){
    $scope.changeBusinessComplete();
    $('#dialog-confirm').modal('hide');
  };

  $scope.onLogout = function(){
    $http.post('/financial/index', {
      userID:  $scope.loginUser.userID,
      clockStatus: '4',
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      common.delCookie('loginUser');
      clearInterval($scope.intervalObj);
      location.href = '/';
    }, function errorCallback(response) {
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
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.filterStatus = '';
      $scope.loadBusinessData();
    }, function errorCallback(response){
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.onShowResume = function(receiveUser, userName, clockStatus, resume){
    $scope.currentReceiveUserID = receiveUser;
    $scope.currentReceiveUserName = userName;
    $scope.currentClockStatus = clockStatus;
    $scope.currentResume = resume;

    //判断当前打卡状态
    if($scope.currentClockStatus !== '1'){
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '该理财经理当前为非等待状态，不能发送业务请求。';
      $('#dialog-message').modal('show');
      return false;
    }

    //判断当前是否在等待接单
    $http.get('/lobby/index/business/wait?userID=' + $scope.currentReceiveUserID).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-message').modal('show');
        return false;
      }
      if(response.data.result){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '有一笔业务正在等待该理财经理回复，不能发送业务请求。';
        $('#dialog-message').modal('show');
        return false;
      }
      $('#dialog-send-business').modal('show');
    }, function errorCallback(response) {
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-message').modal('show');
    });
  };

  $scope.onResume = function(){
    $('#dialog-resume').modal('show');
  };

  $scope.onSend = function(){
    //发送接待消息
    $http.post('/lobby/index/business', {
      sendUserID:  $scope.loginUser.userID,
      receiveUserID: $scope.currentReceiveUserID,
      loginUser: $scope.loginUser.userID
    }).then(function successCallback(response) {
      if(response.data.err){
        $scope.alertTitle = '系统提示';
        $scope.alertMessage = '系统异常，请稍后再试。';
        $('#dialog-send-business').modal('hide');
        $('#dialog-message').modal('show');
        return false;
      }
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '业务请求已发送，请稍后。';
      $('#dialog-send-business').modal('hide');
      $('#dialog-message').modal('show');
      $scope.filterStatus = '';
      $scope.loadBusinessData();
    }, function errorCallback(response) {
      $scope.alertTitle = '系统提示';
      $scope.alertMessage = '网络异常，请稍后再试。';
      $('#dialog-send-business').modal('hide');
      $('#dialog-message').modal('show');
    });
  };

  $scope.alertConfirm = function(title, message, confirmType){
    this.modalTitle = title;
    this.confirmMessage = message;
    this.confirmType = confirmType;
    $('#dialog-confirm').modal('show');
  };

  //$scope.initProcess();
});