'use strict';

(function (angular) {
    angular
        .module('geoFenceWidget')
        .controller('WidgetHomeCtrl', ['$scope', '$timeout', 'COLLECTIONS', 'DB', 'Buildfire',
            function ($scope, $timeout, COLLECTIONS, DB, Buildfire) {
                var WidgetHome = this;
                var _skip = 0, _limit = 50, searchOptions, GeoActions, GeoItems = [], GeoInfo, info;
                var showOneTimeAlertFlag=true;
                var notificationId;

                searchOptions = {
                    filter: {"$json.title": {"$regex": '/*'}},
                    skip: _skip,
                    limit: _limit + 1 // the plus one is to check if there are any more
                };

                function init() {
                    GeoInfo = new DB(COLLECTIONS.GeoInfo);
                    GeoInfo.get().then(function (data) {
                        console.log('Got Info in Widget------------', data);
                        info = data;
                    }, function (err) {
                        info = null;
                        console.error('Got Error while getting geoInfo------', err);
                    });

                    GeoActions = new DB(COLLECTIONS.GeoActions);
                    GeoActions.find(searchOptions).then(function (result) {
                        console.log('Item got based on the search------------------Widget Section-------', result);
                        GeoItems = result;
                        watcherFun();
                    }, function (err) {
                        watcherFun();
                        console.error('Error while getting searched items---------------', err);
                    });

                    //Handle notification onClick event
                    Buildfire.notifications.localNotification.onClick = function (data) {
                        Buildfire.actionItems.execute(data.actionToPerform);
                    };

                    // Load Items again on Refresh
                    Buildfire.datastore.onRefresh(function(){
                        init();
                    });
                }

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


                function triggerAction(lat, lng) {
                    GeoItems.forEach(function (item) {
                        var dis;
                        if (item.data && item.data.epicenter && item.data.epicenter.coordinates && item.data.epicenter.coordinates.lng && item.data.epicenter.coordinates.lat) {
                            dis = distance(lat, lng, item.data.epicenter.coordinates.lat, item.data.epicenter.coordinates.lng, 'N');
                            console.log('Distance---------------------', dis, 'Item-------------------------------', item);
                            if (dis < item.data.radius && !item.actionPerformed) {
                                Buildfire.notifications.localNotification.requestPermission(function (err, permissionsGranted) {
                                    if(err) {
                                        console.error('Error occurred while requesting permission', err);
                                    } else {
                                        if(permissionsGranted) {
                                            var options = {
                                                title: item.data.title,
                                                text: item.data.notificationMessage,
                                                data: item.data
                                            };
                                            Buildfire.notifications.localNotification.send(options, function (err, data) {
                                                notificationId = data.id;
                                            });
                                        }
                                    }
                                });
                            }
                            item.actionPerformed = dis < item.data.radius;
                        }
                    })
                }

                function watcherFun() {
                   // getLocation();
                    Buildfire.geo.watchPosition(
                        //{timeout:3000},
                        {enableHighAccuracy: (info && info.data && info.data.highAccuracy) || false, timeout: 30000},
                        function ( position,err) {
                            if (!position.coords.latitude){
                                if(showOneTimeAlertFlag){
                                    alert("Enable your location service to use this plugin");
                                    showOneTimeAlertFlag=false;
                                }
                            }

                            else {
                                console.info('Watching Position------watchId:::', position.watchId, position,' accuracy:' + info.data.highAccuracy ,info);
                                if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                                    triggerAction(position.coords.latitude, position.coords.longitude);
                                }
                            }
                        });
                }

                init();
            }]);
})(window.angular);