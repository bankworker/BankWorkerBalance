let app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
  $scope.model = {
    senderID: 0,
    financialClockList: [],
    businessList: [],
    callBackCount: 0,
    filterStatus: '',
    intervalObj: {},
    intervalSeconds: 20000,
    currentFinancialInfo: {staffName: '', staffPostName: '', staffPhoto: '', staffResume: '', clockStatusText: ''}
  };

  // region 页面初始化数据加载
  $scope.initProcess = function () {
    $scope.checkIsLobby();
    $scope.loadBranchSetting();
    $scope.loadLobbyInfo();
    $scope.loadFinancialClock();
    $scope.loadBusinessData();
    $scope.startMonitor();
  };

  $scope.checkIsLobby = function(){
    let cookieValue = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_USER);
    let lobbyInfo = JSON.parse(cookieValue);

    if(lobbyInfo.staffPostName !== '大堂经理'){
      location.href = '/';
      return false;
    }
  };

  $scope.loadBranchSetting = function(){
    commonUtility.loadBranchSetting();
  };

  $scope.loadLobbyInfo = function (){
    let cookieValue = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_USER);
    let lobbyInfo = JSON.parse(cookieValue);
    $scope.model.senderID = lobbyInfo.staffID;
    $('.options-bar img').attr('src', lobbyInfo.staffPhotoUrl);
    $('#hidden-account').val(lobbyInfo.account);
    $('#hidden-postID').val(lobbyInfo.staffPostID);
  };

  $scope.loadFinancialClock = function(){
    $http.get('/lobby/financialLatestClock').then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      if(response.data.financialClockList === null){
        // bootbox.alert('今天还没有理财经理签到。');
        return false;
      }
      $scope.model.financialClockList = response.data.financialClockList;
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.loadBusinessData = function(){
    $http.get('/lobby/business?senderID=' + $scope.model.senderID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      $scope.model.callBackCount = 0;
      $scope.model.businessList.splice(0, $scope.model.businessList.length);
      if(response.data.businessList === null){
        return false;
      }
      angular.forEach(response.data.businessList,function(business,index){
        if(business.businessStatus === '4'){
          $scope.model.callBackCount++;
        }
      });

      if($scope.model.filterStatus === ''){
        $scope.model.businessList = response.data.businessList;
      }else{
        let filterData = [];
        angular.forEach(response.data.businessList,function(business,index){
          if(business.businessStatus === $scope.model.filterStatus){
            filterData.push(business);
          }
        });
        $scope.model.businessList = filterData;
      }
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };
  // endregion

  // region 发送业务相关操作
  $scope.chooseFinancial = function(currentFinancialInfo) {
    //判断理财经理当前状态
    if(currentFinancialInfo.clockStatus !== ClockStatusConstant.FREE){
      bootbox.alert(currentFinancialInfo.staffName + '当前为非等待状态，不能发送业务请求。');
      return false;
    }

    //判断该理财经理是否有业务待处理或者正在处理业务
    $http.get('/lobby/waitBusiness?receiverID=' + currentFinancialInfo.staffID).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      if(response.data.waitBusiness !== null){
        bootbox.alert(response.data.waitBusiness.senderName + '在' +
            response.data.waitBusiness.sendTime + '给' +
            currentFinancialInfo.staffName + '发送了一个业务，正在等待' +
            currentFinancialInfo.staffName + '接收，等稍后。');
        return false;
      }

      //在此判断理财经理当前状态，场景：理财经理接收业务，但大堂经理端尚未刷新理财经理状态
      $http.get('/financial/clockInfo?staffID=' + currentFinancialInfo.staffID).then(function successCallback(response) {
        if(response.data.err){
          bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
          return false;
        }
        if(response.data.clockInfo === null){
          $scope.loadFinancialClock();
          return false;
        }
        if(response.data.clockInfo.clockStatus !== ClockStatusConstant.FREE){
          bootbox.alert(currentFinancialInfo.staffName + '当前为非等待状态，不能发送业务请求。');
          return false;
        }
        $scope.model.currentFinancialInfo = currentFinancialInfo;
        $('#dialog-send-business').modal('show');
      }, function errorCallback(response) {
        bootbox.alert('网络异常，请检查网络设置。');
      });
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

  $scope.onShowResume = function(){
    $('#dialog-send-business').modal('hide');
    $('#dialog-resume').modal('show');
  };

  $scope.onSend = function(){
    $http.post('/lobby/sendBusiness', {
      senderID:  commonUtility.getLoginUserID(),
      receiverID: $scope.model.currentFinancialInfo.staffID,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response) {
      if(response.data.err){
        $('#dialog-send-business').modal('hide');
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      layer.msg('业务请求已发送，请稍后。');
      $('#dialog-send-business').modal('hide');
      $scope.filterStatus = '';
      $scope.loadBusinessData();
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
      $('#dialog-send-business').modal('hide');
    });
  };
  // endregion

  // region 过滤条件
  $scope.onFilter = function(status){
    $scope.model.filterStatus = status;
    $scope.loadBusinessData();
  };
  // endregion

  // region 业务办理相关操作
  $scope.onLookBack = function(callBackMsg){
    bootbox.alert(callBackMsg);
  };

  $scope.onSendHurry = function(businessID, senderID, receiverID){
    //发送催促消息
    $http.post('/lobby/hurryUp', {
      businessID:  businessID,
      senderID: senderID,
      receiverID: receiverID,
      loginUser: commonUtility.getLoginUser()
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
        return false;
      }
      layer.msg('催促提醒已发送。');
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置。');
    });
  };

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
          $http.put('/lobby/completeBusiness', {
            businessID: businessID,
            loginUser: commonUtility.getLoginUser()
          }).then(function successCallback(response){
            if(response.data.err){
              bootbox.alert('获取业务消息失败，错误编码【' + response.data.code + '】，错误信息【' + response.data.msg + '】');
              return false;
            }
            $scope.filterStatus = '';
            $scope.loadBusinessData();
          }, function errorCallback(response){
            bootbox.alert('网络异常，请检查网络设置。');
          });
        }
      }
    });
  };
  // endregion

  // region 公共方法
  $scope.startMonitor = function(){
    $scope.model.intervalObj = setInterval($scope.monitor, $scope.model.intervalSeconds);
  };

  $scope.monitor = function(){
    $scope.loadFinancialClock();
    $scope.loadBusinessData();
  };

  // endregion

  $scope.initProcess();
});