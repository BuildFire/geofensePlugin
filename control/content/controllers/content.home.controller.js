'use strict';

(function (angular) {
    angular
        .module('geoFencePluginContent')
        .controller('ContentHomeCtrl', ['$scope', '$timeout', 'Utils', 'COLLECTIONS', 'DB', 'Modals', 'DEFAULT_DATA',
            function ($scope, $timeout, Utils, COLLECTIONS, DB, Modals, DEFAULT_DATA) {
                console.log('--------ContentHomeCtrl Controller Loaded-----');
                var ContentHome = this;
                var _skip = 0,
                    _limit = 10;
                var searchOptions = {
                    filter: {"$json.title": {"$regex": '/*'}},
                    skip: _skip,
                    limit: _limit + 1 // the plus one is to check if there are any more
                };
                ContentHome.geoAction = {
                    data: {
                        title: '',
                        actionToPerform: {},
                        epicenter: {address: '', coordinates: {lat: '', long: ''}},
                        radius: 10 //in miles
                    }
                };
                ContentHome.masterGeoAction = {
                    data: {
                        title: '',
                        actionToPerform: {},
                        epicente: {address: '', coordinates: {lat: '', long: ''}},
                        radius: 10 //in miles
                    }
                };

                ContentHome.selectItem = function (item) {
                    console.log('selectItem method called-------------------', item);
                    if (item && item.data) {
                        ContentHome.geoAction = item;
                        updateMasterItem(item);
                        if (item.data.epicenter && item.data.epicenter.coordinates) {
                            ContentHome.center = item.data.epicenter.coordinates;
                            ContentHome.selectedLocation = item.data.epicenter.address;
                        }
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


                ContentHome.addNewItem = function () {
                    ContentHome.geoAction = DEFAULT_DATA.GEO_ACTION;
                    ContentHome.selectedLocation = '';
                    ContentHome.center = {
                        lat: '',
                        lng: ''
                    }
                };


                /**
                 * ContentHome.noMore tells if all data has been loaded
                 */
                ContentHome.noMore = false;

                ContentHome.isBusy = false;
                /**
                 * ContentHome.getMore is used to load the items
                 */
                ContentHome.getMore = function () {
                    if (ContentHome.isBusy && !ContentHome.noMore) {
                        return;
                    }
                    ContentHome.isBusy = true;
                    GeoActions.find(searchOptions).then(function success(result) {
                        if (result.length <= _limit) {// to indicate there are more
                            ContentHome.noMore = true;
                        }
                        else {
                            result.pop();
                            searchOptions.skip = searchOptions.skip + _limit;
                            ContentHome.noMore = false;
                        }
                        ContentHome.items = ContentHome.items ? ContentHome.items.concat(result) : result;
                        console.log('items>>>', angular.copy(ContentHome.items));
                        ContentHome.isBusy = false;
                    }, function fail() {
                        ContentHome.isBusy = false;
                    });
                };


                /**
                 * ContentHome.removeListItem() used to delete an item from section list
                 * @param index tells the index of item to be deleted.
                 */
                ContentHome.removeListItem = function (index, $event) {

                    if ("undefined" == typeof index) {
                        return;
                    }
                    var item = ContentHome.items[index];
                    if ("undefined" !== typeof item) {
                        //buildfire.navigation.scrollTop();

                        Modals.removePopupModal({title: '', event: $event}).then(function (result) {
                            if (result) {
                                if(item.id==ContentHome.geoAction.id){
                                    ContentHome.geoAction=DEFAULT_DATA.GEO_ACTION;
                                    ContentHome.selectedLocation = '';
                                    ContentHome.center = {
                                        lat: '',
                                        lng: ''
                                    }
                                }
                                GeoActions.delete(item.id).then(function (data) {
                                    ContentHome.items.splice(index, 1);
                                }, function (err) {
                                    console.error('Error while deleting an item-----', err);
                                });
                            }
                            else {
                                console.info('Unable to load data.');
                            }
                        }, function (cancelData) {
                            //do something on cancel
                        });
                    }
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

                function insertAndUpdate(_item) {
                    console.log('insertAndUpdate-----------------method called-----', _item);
                    updating = true;
                    if (_item.id) {
                        GeoActions.update(_item.id, _item.data).then(function (data) {
                            console.log('Item updated successfully----------------', data);
                            updateMasterItem(data);
                            updating = false;
                        }, function (err) {
                            updating = false;
                            //console.log('Error while updating data---', err);
                        });
                    }
                   // else if (!isNewItemInserted) {
                    else{
                        isNewItemInserted = true;
                        GeoActions.insert(_item.data).then(function (data) {
                            ContentHome.geoAction = data;
                            ContentHome.items.push(data);
                            updateMasterItem(data);
                            updating = false;
                            console.log('new ---------------- Item inserted-------------------------------', data);
                            //updateMasterItem(ContentItem.item);


                        }, function (err) {
                            //resetItem();
                            updating = false;
                            //isNewItemInserted = false;
                        });
                    }
                }

                //to validate the action with title
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
                }

                $scope.$watch(function () {
                    return ContentHome.geoAction;
                }, updateItemsWithDelay, true);

            }]);
})(window.angular);