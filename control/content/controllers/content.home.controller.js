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
                    epicenter:'',
                    radius: 1000 //in meters
                };
            }]);
})(window.angular);