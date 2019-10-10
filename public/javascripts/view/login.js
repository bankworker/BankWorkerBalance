let app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
  $scope.model = {
    account: '',
    password: '',

    currentBankCode: 0,
    selectedBank: null,
    bankList: [{bankCode: 0, bankName: '请选择银行'}],

    currentBranchCode: 0,
    selectedBranch: null,
    branchList: [{branchCode: 0, branchName: '请选择网点'}],

    selectedStaffPost: null,
    staffPostList: [{staffPostID: 0, staffPostName: '请选择员工岗位'}],

    branchBackImageStyle: {}
  };

  $scope.initPage = function () {
    $scope.loadBank();
    $scope.loadData();
  };

  $scope.loadBank = function(){
    let cookie_bankCode = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_BANKCODE);
    if(cookie_bankCode !== null && cookie_bankCode !== undefined){
      $scope.model.currentBankCode = cookie_bankCode;
    }
    $scope.model.selectedBank = $scope.model.bankList[0];
    $http.get('/login/bankList').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(response.data.msg);
        return false;
      }
      if(response.data.bankList === null){
        return false;
      }
      angular.forEach(response.data.bankList, function (bank) {
        $scope.model.bankList.push({
          bankCode: bank.bankCode,
          bankName: bank.bankName
        });
      });
      if($scope.model.currentBankCode !== 0){
        angular.forEach($scope.model.bankList, function (bank) {
          if(bank.bankCode === $scope.model.currentBankCode){
            $scope.model.selectedBank = bank;
            return false;
          }
        });
      }
      $scope.loadBranch();
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置');
    });
  };

  $scope.loadBranch = function(){
    let cookie_branchCode = commonUtility.getCookie(commonUtility.COOKIE_LOGIN_BRANCHCODE);
    if(cookie_branchCode !== null && cookie_branchCode !== undefined){
      $scope.model.currentBranchCode = cookie_branchCode;
    }

    $scope.model.selectedBranch = $scope.model.branchList[0];
    if($scope.model.branchList.length > 1){
      $scope.model.branchList.splice(1);
    }
    if($scope.model.selectedBank.bankCode === 0){
      $scope.loadStaffPost();
      return false;
    }
    $http.get('/login/branchList?bankCode='+$scope.model.selectedBank.bankCode).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(response.data.msg);
        return false;
      }
      if(response.data.branchList === null){
        $scope.loadStaffPost();
        return false;
      }
      angular.forEach(response.data.branchList, function (branch) {
        $scope.model.branchList.push({
          branchCode: branch.branchCode,
          branchName: branch.branchName
        });
      });
      if($scope.model.currentBranchCode !== 0){
        angular.forEach($scope.model.branchList, function (branch) {
          if(branch.branchCode === $scope.model.currentBranchCode){
            $scope.model.selectedBranch = branch;
            return false;
          }
        });
      }
      $scope.loadStaffPost();
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置');
    });
  };

  $scope.loadStaffPost = function() {
    $scope.model.selectedStaffPost = $scope.model.staffPostList[0];
    if($scope.model.staffPostList.length > 1){
      $scope.model.staffPostList.splice(1);
    }
    if($scope.model.selectedBank.bankCode === 0 || $scope.model.selectedBranch.branchCode === 0){
      return false;
    }
    $http.get('/login/staffPost?bankCode='+$scope.model.selectedBank.bankCode + '&branchCode='+$scope.model.selectedBranch.branchCode).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(response.data.msg);
        return false;
      }
      if(response.data.staffPostList === null){
        $scope.model.selectedStaffPost = $scope.model.staffPostList[0];
        return false;
      }

      angular.forEach(response.data.staffPostList, function (staffPost) {
        $scope.model.staffPostList.push({
          staffPostID: staffPost.staffPostID,
          staffPostName: staffPost.staffPostName
        });
      });

      angular.forEach($scope.model.staffPostList, function (staffPost) {
        if(staffPost.staffPostID === $scope.model.staffPostID){
          $scope.model.selectedStaffPost = staffPost;
        }
      });
    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置');
    });
  };

  $scope.loadData = function(){
    $http.get('/login/backImageSetting').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(response.data.msg);
        return false;
      }
      if(response.data.branchInfo === null){
        return false;
      }

      if(response.data.branchInfo.branchBackImage !== ''){
        $scope.model.branchBackImageStyle = {
          "background": "url(" + response.data.branchInfo.branchBackImage + ") no-repeat center center fixed",
          "background-size": "100%"
        };
      }

    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置');
    });
  };

  $scope.onBankChange = function(){
    $scope.loadBranch();
  };

  $scope.onBranchChange = function(){
    $scope.loadStaffPost();
  };

  $scope.onLogin = function () {
    $http.post('/', {
      bankCode: $scope.model.selectedBank.bankCode,
      branchCode: $scope.model.selectedBranch.branchCode,
      postID: $scope.model.selectedStaffPost.staffPostID,
      cellphone: $scope.model.account,
      password: $scope.model.password
    }).then(function successCallback(response) {
      if(response.data.err){
        bootbox.alert(response.data.msg);
        return false;
      }
      if(response.data.userInfo === null){
        bootbox.alert('您输入的帐号密码不存在！');
        return false;
      }
      //记录Cookie
      commonUtility.setCookie(commonUtility.COOKIE_LOGIN_USER, JSON.stringify(response.data.userInfo));
      commonUtility.setCookie(commonUtility.COOKIE_LOGIN_USERID, response.data.userInfo.accountID);
      commonUtility.setCookie(commonUtility.COOKIE_LOGIN_BANKCODE, response.data.userInfo.bankCode);
      commonUtility.setCookie(commonUtility.COOKIE_LOGIN_BRANCHCODE, response.data.userInfo.branchCode);

      if($scope.model.selectedStaffPost.staffPostName === '大堂经理'){
        location.href = '/lobby';
      }else{
        location.href = '/financial';
      }

    }, function errorCallback(response) {
      bootbox.alert('网络异常，请检查网络设置');
    });
  };

  $scope.initPage();
});