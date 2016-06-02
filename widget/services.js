(function (angular, buildfire) {
    'use strict';
    //created geoFenceServices module
    angular
        .module('geoFenceServices', ['geoFenceEnums'])
        .provider('Buildfire', [function () {
            this.$get = function () {
                return buildfire;
            };
        }])
        .factory("DB", ['Buildfire', '$q', 'MESSAGES', 'CODES', function (Buildfire, $q, MESSAGES, CODES) {
            function DB(tagName) {
                this._tagName = tagName;
            }
            DB.prototype.find = function (options) {
                var that = this;
                var deferred = $q.defer();
                if (typeof options == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.OPTION_REQUIRES));
                }
                Buildfire.datastore.search(options, that._tagName, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            return DB;
        }])
        .factory('GeoDistance', ['$q', '$http', function ($q, $http) {
            var _getDistance = function (origin, items, distanceUnit) {
                var deferred = $q.defer();
                var destinationsMap = [];

                if (!origin || !origin.lat) {
                    deferred.reject({
                        code: 'Lat lng not found',
                        message: 'origin does not have the lat lng'
                    });
                }

                if (!items || !Array.isArray(items) || !items.length) {
                    deferred.reject({
                        code: 'NOT_ARRAY',
                        message: 'destinations is not an Array'
                    });
                }

                items.forEach(function (_dest) {
                    if (_dest && _dest.data && _dest.data.epicenter && _dest.data.epicenter.coordinates && _dest.data.epicenter.coordinates.lat && _dest.data.epicenter.coordinates.lng)
                        destinationsMap.push({lat: _dest.data.epicenter.coordinates.lat, lng: _dest.data.epicenter.coordinates.lng});
                    else
                        destinationsMap.push({lat: 0, lng: 0});
                });

                console.log('Desination ------------------',destinationsMap);

                var service = new google.maps.DistanceMatrixService;
                service.getDistanceMatrix({
                    origins: [origin],
                    destinations: destinationsMap,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: distanceUnit == 'km' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL,
                    avoidHighways: false,
                    avoidTolls: false
                }, function (response, status) {
                    if (status !== google.maps.DistanceMatrixStatus.OK) {
                        deferred.reject(status);
                    } else {
                        console.log('got distance-------------------',response);
                        deferred.resolve(response);
                    }
                });
                return deferred.promise;
            };
            return {
                getDistance: _getDistance
            }
        }])
})(window.angular, window.buildfire);
