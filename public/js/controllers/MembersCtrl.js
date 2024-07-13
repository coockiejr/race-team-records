angular.module('mcrrcApp.members').controller('MembersController', ['$scope', '$location','$timeout','$state','$stateParams','$http', '$analytics', 'AuthService', 'MembersService', 'ResultsService', 'dialogs','$filter', function($scope, $location,$timeout, $state, $stateParams, $http, $analytics, AuthService, MembersService, ResultsService, dialogs, $filter) {

    $scope.authService = AuthService;
    $scope.$watch('authService.isLoggedIn()', function(user) {
        $scope.user = user;
    });
    // var members = Restangular.all('members');


    $scope.sortBy = function(criteria) {
    if ($scope.sortCriteria === criteria) {
      $scope.sortDirection = $scope.sortDirection === '' ? '-' : '';
    } else {
      $scope.sortCriteria = criteria;
      $scope.sortDirection = '';
    }
    };

    $scope.customSortFunction = function(result) {
        if ($scope.sortCriteria === "race.racedate"){           
                return result.race.racedate;                       
        }
        if ($scope.sortCriteria === "time"){            
                return result.time;                   
        }
        if ($scope.sortCriteria === "pace"){        
            if(result.race.isMultisport){
                //"hide" undefined age grade at the end of the list when sorting by pace
               if ($scope.sortDirection === '-'){
                   return -999999;
               }else{
                   return 999999;
               }    
            }          
            return result.time/result.race.racetype.miles;                   
        }      
        if ($scope.sortCriteria === "agegrade"){   
            //"hide" undefined age grade at the end of the list
            if(result.agegrade === undefined){
                if ($scope.sortDirection === '-'){
                    return -999999;
                }else{
                    return 999999;
                }        
            }
            return result.agegrade;                  
        }           
      };


    $scope.membersList = [];
    $scope.query = "";

    // =====================================
    // FILTER PARAMS CONFIG ================
    // =====================================
    $scope.paramModel = {};
    $scope.paramModel.sex = '.*';
    $scope.paramModel.category = '.*';
    $scope.paramModel.limit = '';
    $scope.paramModel.memberStatus = 'current';

    // =====================================
    // ADMIN CONFIG ==================
    // =====================================
    $scope.adminDivisCollapsed = true;
    $scope.adminEditMode = false; //edit or add


    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };



    // =====================================
    // ADMIN OPTIONS ====================
    // =====================================

    $scope.showAddMemberModal = function(resultSource) {
        MembersService.showAddMemberModal(resultSource).then(function(member) {
            if (member !== null) {
                $scope.membersList.push(member);
            }
        });
    };

    // select a member after checking it
    $scope.retrieveMemberForEdit = function(member) {
        MembersService.retrieveMemberForEdit(member).then(function() {});
    };


    $scope.removeMember = function(member) {
        var dlg = dialogs.confirm("Remove Member?", "Are you sure you want to remove this member?");
        dlg.result.then(function(btn) {
            MembersService.deleteMember(member).then(function() {
                var index = $scope.membersList.indexOf(member);
                if (index > -1) $scope.membersList.splice(index, 1);
            });
        }, function(btn) {});
    };

    $scope.onSelectMember = function(item,model){
        $scope.setMember(model);
    };
 
    $scope.getRaceTypeClass = function(s){
        if (s !== undefined){
            return s.replace(/ /g, '')+'-col';
        }
    };

    $scope.filterRaceType = function() {
        console.log("call");
    };

    // set the current member to the display panel
    $scope.setMember = async function(member_light) { 
       if (member_light === undefined) return;
       
       $scope.sortCriteria = "race.racedate";
       $scope.sortDirection = '-';

       //reset page to 1
       $scope.pagination = {
            current: 1
       };  

       // get the member details
       await MembersService.getMember(member_light._id).then(function(fullMember) {
            $scope.currentMember = fullMember;
            $scope.activeTab = 1;
        });        

        ResultsService.getResults({
            sort: '-race.racedate -race.order',
            member: {_id :member_light._id}
        }).then(function(results) {
            $scope.currentMemberResultList = results; 

            // get racetypes from these results
            $scope.racetypesList = Object.values($scope.currentMemberResultList.reduce((racetypes, result) => {
                const { _id, race } = result;
                if (!racetypes[race.racetype._id]) {
                    racetypes[race.racetype._id] = race.racetype;
                }
                return racetypes;
            }, {})).sort((a, b) => a.meters - b.meters);
            // console.log($scope.racetypesList);

        });
        

        // MembersService.getMemberPbs($scope.currentMember).then(function(results) {
        //     $scope.currentMemberPbsList = results;
        // });

        $state.current.reloadOnSearch = false;
        $location.search('member', $scope.currentMember.firstname + $scope.currentMember.lastname);
        $timeout(function () {
          $state.current.reloadOnSearch = undefined;
        });
        // $scope.activeTab = 1;
        $analytics.eventTrack('viewMember', {
            category: 'Member',
            label: 'viewing member ' + $scope.currentMember.firstname + ' ' + $scope.currentMember.lastname
        });
    };

    function getCatergory(dob){
        return $filter('categoryFilter')(dob);
    }

    $scope.memberListcolumns = [];
   
    function getMemberListColumnIndexForType(member) {        
        if (member.sex === 'Male' && getCatergory(member.dateofbirth) === 'Open'){
            return 0;
        }else if (member.sex === 'Female' && getCatergory(member.dateofbirth) === 'Open'){
            return 1;
        }else if (member.sex === 'Male' && getCatergory(member.dateofbirth) === 'Master'){
            return 2;
        }else if (member.sex === 'Female' && getCatergory(member.dateofbirth) === 'Master'){
            return 3;
        }    
      }

    $scope.getMembers = async function(params_) {
        var params;
        if (params_ === undefined) {
            params = {
                "filters[sex]": $scope.paramModel.sex,
                "filters[category]": $scope.paramModel.category,
                "filters[memberStatus]": $scope.paramModel.memberStatus,
                sort: 'firstname',
                limit: $scope.paramModel.limit
            };
        } else {
            params = params_;
        }

        await MembersService.getMembers(params).then(function(members) {
            $scope.membersList = members;
            $scope.memberListcolumns = [];
            for (var i = 0; i < 4; i++) {
                $scope.memberListcolumns.push([]);
            }
            $scope.membersList.forEach(function(person) {
                var columnIndex = getMemberListColumnIndexForType(person);
                $scope.memberListcolumns[columnIndex].push(person);
              });              
        });
    };

    $scope.getMaxColumnSize = function() {
        var maxColumnSize = 0;
      
        $scope.memberListcolumns.forEach(function(column) {
          if (column.length > maxColumnSize) {
            maxColumnSize = column.length;
          }
        });      
        return maxColumnSize;
      };

    $scope.retrieveResultForEdit = function(result) {
        ResultsService.retrieveResultForEdit(result).then(function(result) {});
    };


    


    $scope.removeResult = function(result) {
        var dlg = dialogs.confirm("Remove Result?","Are you sure you want to remove this result?");
        dlg.result.then(function(btn) {
            ResultsService.deleteResult(result).then(function() {
                var index = $scope.currentMemberResultList.indexOf(result);
                if (index > -1) $scope.currentMemberResultList.splice(index, 1);
            });
        }, function(btn) {});
    };


    // $scope.defaultPBdistances = ["1 mile","5k", "10k", "10 miles", "Half Marathon","Marathon"];
    
    // $scope.pbTableProperties = {};
    // $scope.pbTableProperties.surface = "road";
    // $scope.surfaceTypes = ["road", "track","cross country", "ultra"];
    // $scope.isAllDistancesPresent = () => {
    // return $scope.currentMember.personalBests.every(pb => $scope.defaultPBdistances.includes(pb.name));
    // };
    
    
    // =====================================
    // MEMBER API CALLS ====================
    // =====================================

    // $scope.user = data.user;
    // when landing on the page, get all members and show them

    // get all members if we have a member in the url
    if($stateParams.member){
        $scope.paramModel.memberStatus = 'all';
    }

    var defaultParams = {
        "filters[sex]": $scope.paramModel.sex,
        "filters[category]": $scope.paramModel.category,
        "filters[memberStatus]": $scope.paramModel.memberStatus,
        select: '-bio -personalBests',
        sort: 'firstname',
        limit: $scope.paramModel.limit
    };

    async function initialLoad(member){
        // wait for async call to finish       
        await $scope.getMembers(defaultParams);

        if($stateParams.member){
            for (i = 0; i < $scope.membersList.length; i++) {                
                if (($scope.membersList[i].firstname+$scope.membersList[i].lastname).toUpperCase() === ($stateParams.member).toUpperCase()){
                    $scope.setMember($scope.membersList[i]);     
                }
            }
        }
    }

    $scope.showRaceModal = function(race) {
        if(race){
            ResultsService.showRaceFromResultModal(race._id).then(function(result) {                
            });
        }
    };

    $scope.showResultDetailsModal = function(result) {
        ResultsService.showResultDetailsModal(result).then(function(result) {});
    };

    initialLoad();

}]);


angular.module('mcrrcApp.members').controller('MemberModalInstanceController', ['$scope', '$uibModalInstance', '$filter', 'member', function($scope, $uibModalInstance, $filter, member) {

    // make sure dates are always UTC
    // $scope.$watch('formData.dateofbirth ', function(date) {
    //   $scope.formData.dateofbirth = $filter('date')($scope.formData.dateofbirth, 'yyyy-MM-dd', 'UTC');
    // });

    // $scope.$watch('formData.addMembershipDates', function(date) {
    //   if ($scope.formData.membershipDates){
    //     for (i=0;i<$scope.formData.membershipDates.length;i++) {
    //         $scope.formData.membershipDates[i].start = $filter('date')($scope.formData.membershipDates[i].start, 'yyyy-MM-dd', 'UTC');
    //         $scope.formData.membershipDates[i].end = $filter('date')($scope.formData.membershipDates[i].end, 'yyyy-MM-dd', 'UTC');
    //     }
    //   }
    // });



    $scope.editmode = false;
    if (member) {
        $scope.formData = member; 
        $scope.formData.dateofbirth = new Date(member.dateofbirth); 
        $scope.editmode = true;
        for (i=0;i<$scope.formData.membershipDates.length;i++) {
            if ($scope.formData.membershipDates[i].start !== undefined){
                $scope.formData.membershipDates[i].start = new Date($scope.formData.membershipDates[i].start);
            }
            if ($scope.formData.membershipDates[i].end !== undefined){
                $scope.formData.membershipDates[i].end = new Date($scope.formData.membershipDates[i].end);
            }
        }
       
    } else {
        $scope.formData = {};
        $scope.formData.memberStatus = 'current';
        $scope.formData.dateofbirth = new Date($filter('date')(new Date().setHours(0,0,0,0), 'yyyy-MM-dd', 'UTC'));
        $scope.editmode = false;
    }


    $scope.addMembershipDates = function(){
      if (!$scope.formData.membershipDates){
        $scope.formData.membershipDates = [];
      }
      $scope.formData.membershipDates.push({start:new Date($filter('date')(new Date().setHours(0,0,0,0), "yyyy-MM-dd", 'UTC')), end:new Date($filter('date')(new Date().setHours(0,0,0,0), "yyyy-MM-dd", 'UTC'))});
    };



    $scope.addMember = function() {
        $uibModalInstance.close($scope.formData);
    };

    $scope.editMember = function() {
        $uibModalInstance.close($scope.formData);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    // =====================================
    // DATE PICKER CONFIG ==================
    // =====================================
    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.openedMembershipStartDatePickers = [];
    $scope.openStartDatePicker = function($event, index) {
        $event.preventDefault();
        $event.stopPropagation();

        for (i=0;i<$scope.openedMembershipStartDatePickers.length;i++) {
            $scope.openedMembershipStartDatePickers[i] = false;
        }
        $scope.openedMembershipStartDatePickers[index] = true;
    };

    $scope.openedMembershipEndDatePickers = [];
    $scope.openEndDatePicker = function($event, index) {
        $event.preventDefault();
        $event.stopPropagation();

        for (i=0;i<$scope.openedMembershipEndDatePickers.length;i++) {
            $scope.openedMembershipEndDatePickers[i] = false;
        }
        $scope.openedMembershipEndDatePickers[index] = true;
    };


}]);
