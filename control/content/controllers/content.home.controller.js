'use strict';

(function (angular) {
    angular
        .module('geoFencePluginContent')
        .controller('ContentHomeCtrl', ['$scope', '$timeout', 'Utils', 'COLLECTIONS', 'DB', 'Modals', 'DEFAULT_DATA', 'Buildfire',
            function ($scope, $timeout, Utils, COLLECTIONS, DB, Modals, DEFAULT_DATA, Buildfire) {
                var ContentHome = this;
                ContentHome.updatingData = false;
                var _skip, _limit, searchOptions, tmrDelayForItem, GeoActions, GeoInfo, updating;

                /**
                 * calculateRadiusInMilesAndFeet calculates the radius in miles and feet
                 * @param radiusInMiles
                 */
                function calculateRadiusInMilesAndFeet(radiusInMiles) {
                    ContentHome.radiusMiles = parseInt(radiusInMiles);
                    if (ContentHome.radiusMiles) {
                        ContentHome.radiusFeet = parseInt((parseFloat(radiusInMiles) % ContentHome.radiusMiles) * 5280);
                    }
                    else {
                        ContentHome.radiusFeet = parseInt(parseFloat(radiusInMiles) * 5280);
                    }
                }

                /**
                 * errorAddress shows the error message when copied address is invalid
                 */
                function errorAddress() {
                    ContentHome.validCopyAddressFailure = true;
                    $timeout(function () {
                        ContentHome.validCopyAddressFailure = false;
                    }, 5000);
                }

                /**
                 * errorCoordinates shows the error message when copied coordinates are invalid
                 * @param err
                 */
                function errorCoordinates(err) {
                    ContentHome.validCoordinatesFailure = true;
                    $timeout(function () {
                        ContentHome.validCoordinatesFailure = false;
                    }, 5000);
                }

                /**
                 * successSetCoordinates sets the coordinates
                 * @param resp
                 */
                function successSetCoordinates(resp) {
                    if (resp) {
                        ContentHome.center = {
                            lng: parseFloat(ContentHome.selectedLocation.split(",")[1].trim()),
                            lat: parseFloat(ContentHome.selectedLocation.split(",")[0].trim())
                        };
                        ContentHome.geoAction.data.epicenter.coordinates=ContentHome.center;
                        ContentHome.geoAction.data.epicenter.address=ContentHome.selectedLocation;
                    }
                }

                /**
                 * updateMasterItem will update the ContentMedia.masterItem with passed item
                 * @param item
                 */
                function updateMasterItem(item) {
                    ContentHome.masterGeoAction = angular.copy(item);
                }

                /**
                 * resetItem will reset the ContentMedia.item with ContentMedia.masterItem
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

                /**
                 * insertAndUpdate inserts and  updates the item
                 * @param _item
                 */
                function insertAndUpdate(_item) {
                    var index1;
                    ContentHome.updatingData = true;
                    updating = true;
                    if (_item.id) {
                        GeoActions.update(_item.id, _item.data).then(function (data) {
                            updateMasterItem(data);
                            ContentHome.items.filter(function (item, index) {
                                if (item.id == _item.id) {
                                    index1 = index;
                                }
                                return item.id == _item.id;
                            });
                            ContentHome.items[index1] = angular.copy(ContentHome.geoAction);
                            updating = false;
                            ContentHome.updatingData = false;
                        }, function (err) {
                            updating = false;
                            ContentHome.updatingData = false;
                            resetItem();
                            console.error('Error while inserting an item data---', err);
                        });
                    }
                    else {
                        GeoActions.insert(_item.data).then(function (data) {
                            if (data && data.id) {
                                ContentHome.geoAction.id = data.id;
                                ContentHome.items.push(angular.copy(ContentHome.geoAction));
                                updateMasterItem(data);
                            }
                            updating = false;
                            ContentHome.updatingData = false;
                        }, function (err) {
                            console.error('Error while updating an item data---', err);
                            resetItem();
                            updating = false;
                            ContentHome.updatingData = false;
                        });
                    }
                }

                /**
                 * isValidItem tells whether item is valid or not
                 * @param action
                 * @returns {*}
                 */
                function isValidItem(action) {
                    return action.data && action.data.title;
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
                    ContentHome.isItemValid = isValidItem(_item);
                    if (_item && !isUnChanged(_item) && ContentHome.isItemValid) {
                        tmrDelayForItem = $timeout(function () {
                            insertAndUpdate(_item);
                        }, 300);
                    }
                    /* else {
                     if (!ContentHome.isItemValid && ContentHome.geoAction.id)
                     ContentHome.geoAction.data.title = angular.copy(ContentHome.masterGeoAction.data.title);
                     }*/
                }

                /**
                 * getFeetForRadius method return the feet value
                 * @returns {number}
                 */
                function getFeetForRadius() {
                    if (parseInt(ContentHome.radiusMiles))
                        return 0;
                    else
                        return 10;
                }

                /**
                 * initialization of variables
                 */
                function init() {

                    _skip = 0;
                    _limit = 10;
                    searchOptions = {
                        filter: {"$json.title": {"$regex": '/*'}},
                        skip: _skip,
                        limit: _limit + 1 // the plus one is to check if there are any more
                    };
                    tmrDelayForItem = null;
                    GeoActions = new DB(COLLECTIONS.GeoActions);
                    GeoInfo = new DB(COLLECTIONS.GeoInfo);
                    updating = false;
                    ContentHome.radiusMiles = 10;
                    ContentHome.radiusFeet = 0;
                    ContentHome.center = {};
                    ContentHome.geoAction = angular.copy(DEFAULT_DATA.GEO_ACTION);
                    ContentHome.masterGeoAction = angular.copy(DEFAULT_DATA.GEO_ACTION);
                    ContentHome.validCopyAddressFailure = false;
                    ContentHome.validCoordinatesFailure = false;
                    /**
                     * ContentHome.noMore tells if all data has been loaded
                     * @type {boolean}
                     */
                    ContentHome.noMore = false;
                    /**
                     * ContentHome.isBusy tells whether the scrolling is in progress or not.
                     * @type {boolean}
                     */
                    ContentHome.isBusy = false;

                    GeoInfo.get().then(function (data) {
                        if (data && data.id)
                            ContentHome.geoInfo = data;
                        else
                            ContentHome.geoInfo = angular.copy(DEFAULT_DATA.GEO_INFO);
                    }, function (err) {
                        ContentHome.geoInfo = angular.copy(DEFAULT_DATA.GEO_INFO);
                        console.error('Got Error while getting geoInfo------', err);
                    });
                }

                /**
                 * ContentHome.setCoordinates validates and sets the coordinates
                 */
                ContentHome.setCoordinates = function () {
                    var latlng = '';
                    if (ContentHome.selectedLocation) {
                        latlng = ContentHome.selectedLocation.split(',')[1] + "," + ContentHome.selectedLocation.split(',')[0]
                    }
                    Utils.validLongLats(latlng).then(successSetCoordinates, errorCoordinates);
                };

                /**
                 * ContentHome.setLocation sets the address and coordinates
                 * @param data
                 */
                ContentHome.setLocation = function (data) {
                    ContentHome.selectedLocation = data.location;
                    ContentHome.currentCoordinates = data.coordinates;
                    ContentHome.geoAction.data.epicenter.address = data.location;
                    ContentHome.geoAction.data.epicenter.coordinates = ContentHome.center;
                    ContentHome.center.lat = data.coordinates[1];
                    ContentHome.center.lng = data.coordinates[0];
                    if (!$scope.$$phase)$scope.$digest();
                };

                /**
                 * ContentHome.clearData clears the lat/lng
                 */
                ContentHome.clearData = function () {
                    if (!ContentHome.selectedLocation) {
                        ContentHome.center = {
                            lng: '',
                            lat: ''
                        };
                    }
                };

                /**
                 * ContentHome.locationAutocompletePaste finds the location lat/lng
                 */
                ContentHome.locationAutocompletePaste = function () {
                    $timeout(function () {
                        if ($(".pac-container .pac-item").length) {
                            var firstResult = $(".pac-container .pac-item:first").find('.pac-matched').map(function () {
                                return $(this).text();
                            }).get().join();
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
                                    console.error('--lat long does not find-- corresponding to input');
                                }
                            });
                        }
                        else if (ContentHome.selectedLocation && (ContentHome.selectedLocation.split(',').length == 2)) {
                            ContentHome.setCoordinates();
                        }
                        else {
                            errorAddress();
                        }
                    }, 1000);

                };

                /**
                 *  ContentHome.addNewItem allow us to add new Item
                 */
                ContentHome.addNewItem = function () {
                    ContentHome.masterGeoAction = angular.copy(DEFAULT_DATA.GEO_ACTION);
                    ContentHome.geoAction = angular.copy(DEFAULT_DATA.GEO_ACTION);
                    ContentHome.selectedLocation = '';
                    ContentHome.center = {
                        lat: '',
                        lng: ''
                    };
                    ContentHome.radiusMiles = 10;
                    ContentHome.radiusFeet = 0;
                };

                ContentHome.saveInfo = function () {
                    GeoInfo.save(ContentHome.geoInfo.data).then(function (data) {
                    }, function (err) {
                        console.error('Got error while saving data :', err);
                    });
                };

                /**
                 * ContentHome.getMore is used to load the items
                 */
                ContentHome.getMore = function () {
                    if (ContentHome.isBusy && !ContentHome.noMore) {
                        return;
                    }
                    ContentHome.isBusy = true;
                    GeoActions.find(searchOptions).then(function (result) {
                        if (result.length <= _limit) {// to indicate there are more
                            ContentHome.noMore = true;
                        }
                        else {
                            result.pop();
                            searchOptions.skip = searchOptions.skip + _limit;
                            ContentHome.noMore = false;
                        }
                        ContentHome.items = ContentHome.items ? ContentHome.items.concat(result) : result;
                        ContentHome.isBusy = false;
                    }, function () {
                        ContentHome.isBusy = false;
                    });
                };

                /**
                 * ContentHome.updateRadius updates the radius of a geoAction
                 */
                ContentHome.updateRadius = function () {
                    ContentHome.radiusMiles = (parseInt(ContentHome.radiusMiles) || 0);
                    ContentHome.radiusFeet = (parseInt(ContentHome.radiusFeet) || getFeetForRadius());
                    ContentHome.geoAction.data.radius = parseInt(ContentHome.radiusMiles) + parseFloat(ContentHome.radiusFeet / 5280);
                };

                /**
                 * ContentHome.removeListItem() used to delete an item from section list
                 * @param index
                 * @param event
                 */
                ContentHome.removeListItem = function (index, event) {

                    if ("undefined" == typeof index) {
                        return;
                    }
                    var item = ContentHome.items[index];
                    if ("undefined" !== typeof item) {

                        Modals.removePopupModal({event: event}).then(function (result) {
                            if (result) {
                                if (item.id == ContentHome.geoAction.id) {
                                    ContentHome.geoAction = angular.copy(DEFAULT_DATA.GEO_ACTION);
                                    ContentHome.selectedLocation = '';
                                    ContentHome.center = {
                                        lat: '',
                                        lng: ''
                                    };
                                    ContentHome.radiusMiles = 10;
                                    ContentHome.radiusFeet = 0;
                                }
                                GeoActions.delete(item.id).then(function (data) {
                                    ContentHome.items.splice(index, 1);
                                }, function (err) {
                                    console.error('Error while deleting an item-----', err);
                                });
                            }
                        }, function (cancelData) {
                            //do something on cancel
                        });
                    }
                };

                /**
                 * ContentHome.selectItem shows the selected item in edit mode
                 * @param item
                 */
                ContentHome.selectItem = function (item) {
                    if (item && item.data) {
                        updateMasterItem(angular.copy(item));
                        ContentHome.geoAction = angular.copy(item);
                        calculateRadiusInMilesAndFeet(item.data.radius);
                        if (item.data.epicenter && item.data.epicenter.coordinates) {
                            ContentHome.center = item.data.epicenter.coordinates;
                            ContentHome.selectedLocation = item.data.epicenter.address;
                        }
                    }

                };


                /**
                 * ContentHome.clearAction clears the selection action
                 */
                ContentHome.clearAction = function () {
                    ContentHome.geoAction.data.actionToPerform = {};
                };

                /**
                 *  ContentHome.getKeyName returns the value of key
                 * @param key
                 * @returns {*}
                 */
                ContentHome.getKeyName = function (key) {
                    if (key) {
                        switch (key) {
                            case 'action':
                                return 'Action Selected';
                            case 'url':
                                return 'Url';
                            case 'openIn' :
                                return 'OpenIn';
                            case 'title' :
                                return 'Title';
                            case 'email' :
                                return 'Email Address';
                            case 'subject' :
                                return 'Subject';
                            case 'body' :
                                return 'Body';
                            case 'phoneNumber' :
                                return 'PhoneNumber';
                            case 'address' :
                                return 'Address';
                            case 'lat' :
                                return 'Lat';
                            case 'lng' :
                                return 'Lng';
                            default :
                                return key;
                        }
                    }

                };

                /**
                 * ContentHome.openActionPopup opens the Popup to select the action
                 */
                ContentHome.openActionPopup = function () {
                    var action;
                    if (ContentHome.geoAction.data.actionToPerform && ContentHome.geoAction.data.actionToPerform.action)
                        action = ContentHome.geoAction.data.actionToPerform;
                    else
                        action = null;
                    var linkOptions = {"icon": "true"};
                    var callback = function (error, result) {
                        if (error) {
                            return console.error('Error while selecting an action : ', error);
                        }
                        if (result)
                            ContentHome.geoAction.data.actionToPerform = result;
                        if (!$scope.$$phase)$scope.$digest();
                    };
                    Buildfire.actionItems.showDialog(action, linkOptions, callback);
                };

                /**
                 * Watcher to save the data with every change
                 */
                $scope.$watch(function () {
                    return ContentHome.geoAction;
                }, updateItemsWithDelay, true);

                init();
            }]);
})(window.angular);