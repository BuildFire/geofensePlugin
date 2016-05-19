'use strict';

(function (angular) {
    angular
        .module('geoFencePluginContent')
        .controller('ContentHomeCtrl', ['$scope', '$timeout', 'Utils', 'COLLECTIONS', 'DB',
            function ($scope, $timeout, Utils, COLLECTIONS, DB) {
                console.log('--------ContentHomeCtrl Controller Loaded-----');
                var ContentHome = this;
                ContentHome.geoAction = {
                    data: {

                        title: '',
                        actionToPerform: {},
                        epicenter: {address: '', coordinates: {lat: '', long: ''}},
                        radius: 1000 //in meters
                    }
                };

                var tmrDelayForItem = null
                    , GeoActions = new DB(COLLECTIONS.GeoActions)
                    , updating = false
                    , isNewItemInserted = false;
                ContentHome.center = {};

                ContentHome.setLocation = function (data) {
                    console.log('SetLoaction caleed-------------------', data);
                    ContentHome.selectedLocation = data.location;
                    ContentHome.currentCoordinates = data.coordinates;

                    ContentHome.geoAction.data.epicenter.address = data.location;
                    ContentHome.geoAction.data.epicenter.coordinates = ContentHome.center;

                    ContentHome.center.lat = data.coordinates[1];
                    ContentHome.center.lng = data.coordinates[0];
                    $scope.$digest();
                };


                ContentHome.setCoordinates = function () {
                    var latlng = '';
                    console.log('ng-enter---------------------called-----ContentHome.selectedLocation-------------', ContentHome.selectedLocation);
                    function successCallback(resp) {
                        console.error('Successfully validated coordinates-----------', resp);
                        if (resp) {
                            ContentHome.center = {
                                lng: parseInt(ContentHome.selectedLocation.split(",")[1].trim()),
                                lat: parseInt(ContentHome.selectedLocation.split(",")[0].trim())
                            };
                        } else {
                            //errorCallback();
                        }
                    }

                    function errorCallback(err) {
                        console.error('Error while validating coordinates------------', err);
                        ContentHome.validCoordinatesFailure = true;
                        $timeout(function () {
                            ContentHome.validCoordinatesFailure = false;
                        }, 5000);
                    }

                    if (ContentHome.selectedLocation) {
                        latlng = ContentHome.selectedLocation.split(',')[1] + "," + ContentHome.selectedLocation.split(',')[0]
                    }

                    Utils.validLongLats(latlng).then(successCallback, errorCallback);
                };
                ContentHome.clearData = function () {
                    if (!ContentHome.selectedLocation) {
                        ContentHome.center = {
                            lng: '',
                            lat: ''
                        };
                    }
                };

                ContentHome.validCopyAddressFailure = false;
                ContentHome.locationAutocompletePaste = function () {
                    function error() {
                        console.error('ERROOR emethpdd called');
                        ContentHome.validCopyAddressFailure = true;
                        $timeout(function () {
                            ContentHome.validCopyAddressFailure = false;
                        }, 5000);

                    }

                    $timeout(function () {
                        console.log('val>>>', $("#googleMapAutocomplete").val());
                        console.log('.pac-container .pac-item', $(".pac-container .pac-item").length);
                        if ($(".pac-container .pac-item").length) {
                            var firstResult = $(".pac-container .pac-item:first").find('.pac-matched').map(function () {
                                return $(this).text();
                            }).get().join(); // + ', ' + $(".pac-container .pac-item:first").find('span:last').text();
                            console.log('firstResult', firstResult);
                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode({"address": firstResult}, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    var lat = results[0].geometry.location.lat(),
                                        lng = results[0].geometry.location.lng();
                                    ContentHome.geoAction.data.epicenter.address = firstResult;
                                    ContentHome.geoAction.data.epicenter.lat = lat;
                                    ContentHome.geoAction.data.epicenter.lng = lng;
                                    ContentHome.center = {lat: lat, lng: lng};
                                    $("#googleMapAutocomplete").blur();
                                }
                                else {
                                    console.error('' +
                                        'Error else parts of google');
                                    error();
                                }
                            });
                        }
                        else if (ContentHome.selectedLocation && ContentHome.selectedLocation.split(',').length) {
                            console.log('Location found---------selectedLocation------------', ContentHome.selectedLocation.split(',').length, ContentHome.selectedLocation.split(','));
                            ContentHome.setCoordinates();
                        }
                        else {
                            error();
                        }
                    }, 1000);

                };


                /**
                 * This updateMasterItem will update the ContentMedia.masterItem with passed item
                 * @param item
                 */
                function updateMasterItem(item) {
                    ContentHome.masterGeoAction = angular.copy(item);
                }

                /**
                 * This resetItem will reset the ContentMedia.item with ContentMedia.masterItem
                 */
                function resetItem() {
                    ContentHome.geoAction.data = angular.copy(ContentHome.masterGeoAction);
                }


                /**
                 * isUnChanged to check whether there is change in controller media item or not
                 * @param item
                 * @returns {*|boolean}
                 */
                function isUnChanged(item) {
                    return angular.equals(item, ContentHome.masterGeoAction);
                }

                ContentHome.insertAndUpdate = function (_item) {
                    console.log('insertAndUpdate-----------------method called-----');
                    updating = true;
                    if (_item.id) {
                        GeoActions.update(_item.id, _item.data).then(function (data) {
                            console.log('Item updated successfully----------------',data);
                            updating = false;
                        }, function (err) {
                            updating = false;
                            //console.log('Error while updating data---', err);
                        });
                    }
                    else if (!isNewItemInserted) {
                        isNewItemInserted = true;
                        GeoActions.insert(_item.data).then(function (data) {
                            ContentHome.geoAction=data;
                            updateMasterItem(data);
                            console.log('new ---------------- Item inserted-------------------------------', data);
                            //updateMasterItem(ContentItem.item);


                        }, function (err) {
                            //resetItem();
                            updating = false;
                            //isNewItemInserted = false;
                        });
                    }
                };

                //to validate the action with title
                function isValidItem(action) {
                    return action.title;
                }


                /**
                 * updateItemWithDelay called when ever there is some change in current geo action
                 * @param _item
                 */
                function updateItemsWithDelay(_item) {
                    if (updating)
                        return;
                    if (tmrDelayForItem) {
                        $timeout.cancel(tmrDelayForItem);
                    }
                    ContentHome.isItemValid = isValidItem(ContentHome.geoAction.data);
                    if (_item && !isUnChanged(_item) && ContentHome.isItemValid) {
                        tmrDelayForItem = $timeout(function () {
                            insertAndUpdate(_item);
                        }, 300);
                    }
                }

                /*$scope.$watch(function () {
                 return ContentHome.geoAction.data;
                 }, updateItemsWithDelay, true);*/

            }]);
})(window.angular);