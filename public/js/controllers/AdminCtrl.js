angular.module('mcrrcApp.results').controller('AdminController', ['$scope', 'AuthService', 'ResultsService', function($scope, AuthService, ResultsService) {
    $scope.user = AuthService.isLoggedIn();


    ResultsService.getRaceTypes({
        sort: 'meters'
    }).then(function(raceTypes) {
        $scope.racetypesList = raceTypes;
    });


    $scope.showAddRaceTypeModal = function() {
        ResultsService.showAddRaceTypeModal().then(function(racetype) {
            $scope.racetypesList.push(racetype);
        });
    };

    // select a racetype after checking it
    $scope.retrieveRaceTypeForEdit = function(racetype) {
        ResultsService.retrieveRaceTypeForEdit(racetype).then(function() {});
    };

    $scope.removeRaceType = function(racetype) {
        ResultsService.deleteRaceType(racetype).then(function() {
            var index = $scope.racetypesList.indexOf(racetype);
            if (index > -1) $scope.racetypesList.splice(index, 1);
        });
    };



}]);

angular.module('mcrrcApp.results').controller('RaceTypeModalInstanceController', ['$scope', '$modalInstance', 'racetype', function($scope, $modalInstance, racetype) {


    $scope.editmode = false;
    if (racetype) {
        $scope.formData = racetype;
        $scope.editmode = true;
    } else {
        $scope.formData = {};
        $scope.editmode = false;
    }

    $scope.surfaces = ['road', 'track', 'cross country', 'ultra', 'other'];

    $scope.addRaceType = function() {
        $modalInstance.close($scope.formData);
    };

    $scope.editRaceType = function() {
        $modalInstance.close($scope.formData);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };



}]);
