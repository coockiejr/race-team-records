var app = angular.module('mcrrcApp');

app.directive('rankingResult', function() {
    return {
				template:	'<span class="hoverhand" ng-show="(result.ranking.agerank !== undefined && result.ranking.agerank !== \'\') || (result.ranking.genderrank !== undefined && result.ranking.genderrank !== \'\') || (result.ranking.overallrank !== undefined && result.ranking.overallrank !== \'\')"  tooltip-trigger="mouseenter"  uib-tooltip-html="\'<span>{{result.ranking | rankTooltip}}</span>\'" >{{result.ranking.agerank}} / {{result.ranking.genderrank}} / {{result.ranking.overallrank}}</span>'
    };
});

app.directive('resultIcon', function() {
    return {
        scope: {
          result:'=result',
          race:'=race'
        },
        link: function($scope, element, attrs) {
          // $scope.imgsrc = "";
          // $scope.title = "";

          function isSameDay(date1, date2) {
            return date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCDate() === date2.getUTCDate();
          }

          //return thanksgiving date for a given year.
          function thanksgivingDayUSA(year){
            first = new Date(year,10,1);
            day_of_week = first.getUTCDay();
            return new Date(year,10,22 + (11 - day_of_week) % 7);
          }

          if ($scope.result.customOptions !== undefined){
            $scope.resultIcons = $scope.result.customOptions.filter(x => x.name === "resultIcon");
          }
          if ($scope.result.achievements !== undefined){
            $scope.raceCounts = $scope.result.achievements.filter(x => x.name === "raceCount");
            $scope.pbs = $scope.result.achievements.filter(x => x.name === "pb");
            $scope.ags = $scope.result.achievements.filter(x => x.name === "agegrade");
          }
          
         if (!$scope.result.race){
          $scope.result.race = $scope.race;
         }

          var d1= new Date($scope.result.race.racedate);
          var raceDate = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
          $scope.isbirthdayRace = false;
          $scope.result.members.forEach(function(member) {
              if(isSameDay(new Date(member.dateofbirth),raceDate)){
                  $scope.isbirthdayRace = true;
              }
          });
          $scope.isThanksgiving = false;
          if (raceDate.getMonth() === 10){ //if November, check if Thanksgiving
            if (isSameDay(thanksgivingDayUSA(raceDate.getUTCFullYear()),raceDate)) {
              $scope.isThanksgiving = true;
            }        
          }
          
          $scope.isFourthOfJuly = false;
          if (raceDate.getUTCMonth() === 6 && raceDate.getUTCDate() === 4){
            $scope.isFourthOfJuly = true;
          }

        },
          template:	'<span ng-if="raceCounts" ng-repeat="ag in ags track by $index" class="hoverhand" uib-tooltip-html="ag.text"><div class="pbBox">🎖️</div></span>' +
          '<span ng-if="raceCounts" ng-repeat="pb in pbs track by $index" class="hoverhand" uib-tooltip-html="pb.text"><div class="pbBox">🧨</div></span>'+
          '<span ng-if="raceCounts" ng-repeat="raceCount in raceCounts track by $index" class="hoverhand" uib-tooltip-html="raceCount.text"><div class="raceCountBox">{{raceCount.value.raceCount}}</div>  </span>'+
          '<span class="hoverhand" uib-tooltip="Birthday Race!" ng-if="isbirthdayRace">🎂</span>' +
          '<span class="hoverhand" uib-tooltip="Thanksgiving Race!" ng-if="isThanksgiving">🦃</span>' +
          '<span class="hoverhand" uib-tooltip="Fourth of July Race!" ng-if="isFourthOfJuly">🎆</span>' +
          '<span ng-if="resultIcons.length >0" ng-repeat="resultIcon in resultIcons track by $index"  class="hoverhand resultIcons" uib-tooltip-html="resultIcon.text"><img ng-src="{{resultIcon.value}}"  ng-style="{\'width\' : resultIcon.width ? resultIcon.width : \'16px\', \'height\' : resultIcon.height ? resultIcon.height : \'16px\' }" ></span>'
          
      };
    
});
