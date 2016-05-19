'use strict';

(function (angular) {
    angular
        .module('geoFencePluginContent')
        .controller('ContentHomeCtrl', ['$scope',
            function ($scope) {
                console.log('--------ContentHomeCtrl Controller Loaded-----');
                var ContentHome=this;
                ContentHome.geoAction={
                    title:'',
                    actionToPerform:{},
                    epicenter:{address:'',coordinates:{lat:'',long:''}},
                    radius: 1000 //in meters
                };
                ContentHome.center={};

                ContentHome.setLocation = function (data) {
                    console.log('SetLoaction caleed-------------------',data);
                    ContentHome.selectedLocation = data.location;
                    ContentHome.currentCoordinates = data.coordinates;

                    ContentHome.geoAction.epicenter.address=data.location;
                    ContentHome.geoAction.epicenter.coordinates=ContentHome.center;

                    ContentHome.center.lat=data.coordinates[1];
                    ContentHome.center.lng=data.coordinates[0];
                    $scope.$digest();
                };

            }]);
})(window.angular);