(function (angular) {
    "use strict";
    //created geoFencePluginContent module
    angular
        .module('geoFenceWidget',
        [
            'geoFenceServices',
            'geoFenceEnums'
        ])
        //injected ui.bootstrap for angular bootstrap component
        .config(['$compileProvider', function ($compileProvider) {

            /**
             * To make href urls safe on mobile
             */
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

        }])
})
(window.angular);
