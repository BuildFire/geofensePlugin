'use strict';

(function (angular) {
    angular
        .module('geoFenceWidget')
        .controller('WidgetHomeCtrl', ['$scope', '$timeout', 'COLLECTIONS', 'DB', 'Buildfire',
            function ($scope, $timeout, COLLECTIONS, DB, Buildfire) {
                var WidgetHome = this;
                var _skip = 0, _limit = 50, searchOptions, GeoActions, GeoItems = [];
                GeoActions = new DB(COLLECTIONS.GeoActions);

                console.log('WidgetHomeCtrl loaded');

                searchOptions = {
                    filter: {"$json.title": {"$regex": '/*'}},
                    skip: _skip,
                    limit: _limit + 1 // the plus one is to check if there are any more
                };

                GeoActions.find(searchOptions).then(function (result) {
                    console.log('Item got based on the search------------------Widget Section-------', result);
                    GeoItems = result;
                    watcherFun();
                }, function (err) {
                    watcherFun();
                    console.error('Error while getting searched items---------------', err);
                });

                function distance(lat1, lon1, lat2, lon2, unit) {
                    var radlat1 = Math.PI * lat1 / 180;
                    var radlat2 = Math.PI * lat2 / 180;
                    var theta = lon1 - lon2;
                    var radtheta = Math.PI * theta / 180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    dist = Math.acos(dist);
                    dist = dist * 180 / Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit == "K") {
                        dist = dist * 1.609344
                    }
                    if (unit == "N") {
                        dist = dist * 0.8684
                    }
                    return dist;
                }


                function trigerAction(lat, lng) {
                    GeoItems.forEach(function (item) {
                        var dis;
                        if (item.data && item.data.epicenter && item.data.epicenter.coordinates && item.data.epicenter.coordinates.lng && item.data.epicenter.coordinates.lat) {
                            dis = distance(lat, lng, item.data.epicenter.coordinates.lat, item.data.epicenter.coordinates.lng, 'N');
                            console.log('Distance---------------------', dis, 'Item-------------------------------', item);
                            if (dis < item.data.radius)
                                Buildfire.actionItems.execute(item.data.actionToPerform);
                        }
                    })
                }


                function watcherFun() {
                    Buildfire.geo.watchPosition(
                        //{timeout:3000},
                        null,
                        function (err, position) {
                            //clearWatcher(position.watchId);
                            if (err)
                                console.error(err);
                            else {
                                console.info('Watching Position---------watchId:::', position.watchId, position);
                                if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                                    trigerAction(position.coords.latitude, position.coords.longitude);
                                }
                            }
                        });
                }

                function clearWatcher(watchId) {
                    Buildfire.geo.clearWatch(watchId, function (err, data) {
                        console.info('Watcher has been cleared-----', err, data);
                        watcherFun();
                    })
                }

            }]);
})(window.angular);