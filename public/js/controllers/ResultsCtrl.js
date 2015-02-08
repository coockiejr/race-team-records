angular.module('mcrrcApp.results').controller('ResultsController', ['$scope', '$analytics', 'AuthService', 'ResultsService', 'dialogs', function($scope, $analytics, AuthService, ResultsService, dialogs) {

    $scope.authService = AuthService;
    $scope.$watch('authService.isLoggedIn()', function(user) {
        $scope.user = user;
    });

    $scope.resultsList = [];


    ResultsService.getResults({
        "sort": '-racedate +racename +time'
    }).then(function(results) {
        $scope.resultsList = results;
    });



    $scope.showAddResultModal = function() {
        ResultsService.showAddResultModal().then(function(result) {
            if (result !== null) {
                $scope.resultsList.push(result);
            }
        });
    };

    $scope.retrieveResultForEdit = function(result) {
        ResultsService.retrieveResultForEdit(result).then(function() {});
    };

    $scope.removeResult = function(result) {
        var dlg = dialogs.confirm("Remove Result?", "Are you sure you want to remove this result?");
        dlg.result.then(function(btn) {
            ResultsService.deleteResult(result).then(function() {
                var index = $scope.resultsList.indexOf(result);
                if (index > -1) $scope.resultsList.splice(index, 1);
            });
        }, function(btn) {});
    };

}]);

angular.module('mcrrcApp.results').controller('ResultModalInstanceController', ['$scope', '$modalInstance','$filter', 'result', 'MembersService', 'ResultsService', 'localStorageService', function($scope, $modalInstance, $filter, result, MembersService, ResultsService, localStorageService) {

    MembersService.getMembers().then(function(members) {
        $scope.membersList = members;

    });

    ResultsService.getRaceTypes().then(function(racetypes) {
        $scope.racetypesList = racetypes;
    });


    $scope.editmode = false;
    if (result) {
        $scope.formData = result;
        $scope.editmode = true;
        $scope.formData.dateofbirth = new Date();
        $scope.nbOfMembers = result.member.length;
        $scope.time = {};
        $scope.time.hours = Math.floor($scope.formData.time / 3600);
        $scope.time.minutes = Math.floor($scope.formData.time / 60) % 60;
        $scope.time.seconds = $scope.formData.time % 60;
    } else {
        $scope.formData = {};
        $scope.formData.racename = localStorageService.get('raceName');
        $scope.formData.racedate = localStorageService.get('raceDate');
        $scope.formData.racetype = localStorageService.get('raceType');
        $scope.formData.resultlink = localStorageService.get('resultLink');

        $scope.formData.member = [];
        $scope.formData.member[0] = {};
        $scope.nbOfMembers = 1;
        $scope.time = {};
        $scope.editmode = false;

    }



    $scope.addResult = function() {
        if ($scope.time.hours === undefined) $scope.time.hours = 0;
        if ($scope.time.minutes === undefined) $scope.time.minutes = 0;
        if ($scope.time.seconds === undefined) $scope.time.seconds = 0;
        $scope.formData.time = $scope.time.hours * 3600 + $scope.time.minutes * 60 + $scope.time.seconds;

        var members = $.map($scope.formData.member, function(value, index) {
            return [value];
        });
        $scope.formData.member = members;

        //if we are adding a result, save race related info for futur addition
        if (!$scope.editMode) {
            localStorageService.set('raceName', $scope.formData.racename);
            localStorageService.set('raceDate', $filter('date')($scope.formData.racedate,"yyyy-MM-dd"));
            console.log($filter('date')($scope.formData.racedate,"yyyy-MM-dd"));

            localStorageService.set('raceType', $scope.formData.racetype);
            localStorageService.set('resultLink', $scope.formData.resultlink);
        }

        $modalInstance.close($scope.formData);
    };

    $scope.clearForm = function() {
        $scope.formData = {};
        localStorageService.remove('raceName');
        localStorageService.remove('raceDate');
        localStorageService.remove('raceType');
        localStorageService.remove('resultLink');
    };

    $scope.editResult = function() {
        $scope.formData.time = $scope.time.hours * 3600 + $scope.time.minutes * 60 + $scope.time.seconds;
        $modalInstance.close($scope.formData);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.addNbMembers = function() {
        $scope.nbOfMembers = $scope.formData.member.length + 1;
        $scope.updateNbMembers();
    };

    $scope.updateNbMembers = function() {
        var num = $scope.nbOfMembers;
        var size = $scope.formData.member.length;
        if (num > size) {
            for (i = 0; i < num - size; i++) {
                $scope.formData.member.push({});
            }
        } else {
            $scope.formData.member.splice($scope.nbOfMembers, size - $scope.nbOfMembers);
        }
    };




    // =====================================
    // DATE PICKER CONFIG ==================
    // =====================================


    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };


}]);
