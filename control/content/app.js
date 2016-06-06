(function (angular) {
    "use strict";
    //created geoFencePluginContent module
    angular
        .module('geoFencePluginContent',
        [
            'geoFenceServices',
            'geoFenceEnums',
            'ngAnimate',
            'ui.bootstrap',
            'infinite-scroll',
            'geoFenceModals'

        ])
        //injected ui.bootstrap for angular bootstrap component
        .config(['$compileProvider', '$httpProvider', function ($compileProvider, $httpProvider) {

            /**
             * To make href urls safe on mobile
             */
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

            var interceptor = ['$q', function ($q) {
                var counter = 0;

                return {

                    request: function (config) {
                        buildfire.spinner.show();
                        counter++;
                        return config;
                    },
                    response: function (response) {
                        counter--;
                        if (counter === 0) {
                            buildfire.spinner.hide();
                        }
                        return response;
                    },
                    responseError: function (rejection) {
                        counter--;
                        if (counter === 0) {
                            buildfire.spinner.hide();
                        }
                        return $q.reject(rejection);
                    }
                };
            }];
            $httpProvider.interceptors.push(interceptor);
        }])
})
(window.angular);
