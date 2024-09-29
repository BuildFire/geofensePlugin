(function (angular) {
    "use strict";
    // created geoFencePluginContent module
    angular
      .module('geoFencePluginContent', [
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
      .service('ScriptLoaderService', ['$q', function ($q) {
          this.loadScript = function () {

              const {apiKeys} = buildfire.getContext();
              const {googleMapKey} = apiKeys;

              const url = `https://maps.googleapis.com/maps/api/js?key=${googleMapKey}&v=weekly&libraries=places`;

              const deferred = $q.defer();

              // Check if the script is already loaded
              if (document.querySelector(`script[src="${url}"]`)) {
                  deferred.resolve(); // Already loaded
              } else {
                  // If not, load the script
                  const script = document.createElement('script');
                  script.type = 'text/javascript';
                  script.src = url;

                  script.onload = function () {
                      deferred.resolve();
                  };

                  script.onerror = function () {
                      deferred.reject('Failed to load Google Maps script.');
                  };

                  window.gm_authFailure = () => {
                      deferred.reject('Failed to authenticate Google Maps API.');
                  };

                  document.head.appendChild(script);
              }

              return deferred.promise;
          };
      }])
      .run(['ScriptLoaderService', '$q', function (ScriptLoaderService, $q) {
          // Create a global promise for Google Maps loading
          angular.module('geoFencePluginContent').googleMapsReady = $q.defer();

          ScriptLoaderService.loadScript()
            .then(function () {
                // Resolve the global promise when the script is loaded
                angular.module('geoFencePluginContent').googleMapsReady.resolve();
            })
            .catch(function (err) {
                console.error('Google Maps failed to load:', err);
                angular.module('geoFencePluginContent').googleMapsReady.reject(err);
            });
      }])
})(window.angular);
