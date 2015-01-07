var app = angular.module('mcrrcApp', ['restangular', 'ui.bootstrap', 'ui.router', 'appRoutes', 'MainCtrl', 'TeamCtrl', 'LoginCtrl', 'SignUpCtrl', 'ProfileCtrl', 'AuthService']);

app.run(['$http', 'AuthService','Restangular', function($http, AuthService,Restangular) {
    Restangular.setBaseUrl('/api/');
    Restangular.setRestangularFields({
      id: "_id"
    });

    $http.get("/api/login").success(function(data, status) {
        AuthService.setUser(data.user);
    }).error(function(data) {
        $scope.message = data[0];
        $state.go('/login');
    });
}]);
