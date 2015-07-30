// Filename: public/smartthings.js

angular.module('SmartTVWatcherApp', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'main.html',
    }).
    when('/play/:deviceId', {
      templateUrl: 'play.html',
      controller: 'GameCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}])
.constant('SECONDS_FOR_CORRECT_ANSWER', 50)
.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])
.controller('GameCtrl', ['$scope', '$http', '$routeParams', 'SECONDS_FOR_CORRECT_ANSWER', function($scope, $http, $routeParams, POINTS_FOR_CORRECT_ANSWER) {
  $scope.timeLeft = 0;
  $scope.deviceId = $routeParams.deviceId;
  $scope.deviceName = $routeParams.deviceName;

  $http.get('/api/gettime/'+$scope.deviceId).success(function(response) {
    console.log(response);
    $scope.timeLeft = response.timeLeft;
  });

  $scope.generateProblem = function() {
    var a = Math.floor(Math.random()*10);
    var b = Math.floor(Math.random()*10);

    $scope.answer = a+b;
    $scope.problem = a+'+'+b+' = ?';
    $scope.answers = [a+b, a+b-1, a+b+1];

    for(var j, x, i = $scope.answers.length; i; j = Math.floor(Math.random() * i), x = $scope.answers[--i], $scope.answers[i] = $scope.answers[j], $scope.answers[j] = x);
  }

  $scope.checkAnswer = function(answer) {
    if($scope.answer == answer) {
      $http.post('/api/addtime/'+$scope.deviceId+'/'+SECONDS_FOR_CORRECT_ANSWER).success(function(response) {
        $scope.timeLeft = response.timeLeft;
        $scope.generateProblem();
      });
    } else {
      alert('Not quite!');
      $scope.generateProblem();
    }
  }

  $scope.generateProblem();
}]);