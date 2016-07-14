'use strict';

(function (angular) {
    angular
        .module('geoFenceWidget')
        .controller('WidgetHomeCtrl', ['$scope', '$timeout', 'COLLECTIONS', 'DB', 'Buildfire',
            function ($scope, $timeout, COLLECTIONS, DB, Buildfire) {
                var WidgetHome = this;
                var showOneTimeAlertFlag = true;

                $scope.latitude = 0;
                $scope.longitude = 0;

                // getLocation();
                Buildfire.geo.watchPosition(
                    {enableHighAccuracy: false, timeout: 30000},
                    function (position) {
                        if (!position.coords.latitude) {
                            if (showOneTimeAlertFlag) {
                                Buildfire.notifications.alert({message: "Enable your location service to use this plugin"});
                                showOneTimeAlertFlag = false;
                            }
                        } else {
                            console.info('Watching Position------watchId:::', position.watchId, position);
                            $scope.latitude = position.coords.latitude;
                            $scope.longitude = position.coords.longitude;
                            $scope.$apply();
                        }
                    });

            }]);
})(window.angular);