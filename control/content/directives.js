(function (angular,buildfire) {
    "use strict";
    angular
        .module('geoFencePluginContent', [])
        .directive('googleLocationSearch', function () {
            return {
                restrict: 'A',
                scope: {setLocationInController: '&callbackFn'},
                link: function (scope, element, attributes) {
                    var options = {
                        types: ['geocode']
                    };
                    var autocomplete = new google.maps.places.Autocomplete(element[0], options);
                    google.maps.event.addListener(autocomplete, 'place_changed', function () {
                        var location = autocomplete.getPlace().formatted_address;
                        if (autocomplete.getPlace().geometry) {
                            var coordinates = [autocomplete.getPlace().geometry.location.lng(), autocomplete.getPlace().geometry.location.lat()];
                            scope.setLocationInController({
                                data: {
                                    location: location,
                                    coordinates: coordinates
                                }
                            });
                        }
                    });
                }
            };
        })
        .directive("googleMap", function () {
            return {
                template: "<div></div>",
                /*replace: true,
                scope: {coordinates: '=', draggedGeoData: '&draggedFn'},*/
                link: function (scope, elem, attrs) {

                    buildfire.geo.getCurrentPosition(function(err,data){
                        console.log('getCurrentPosition data------',data,'getCurrentPosition----err-----',err);
                    });

                    console.log('elem--------------------------------directive---',elem);
                    console.log('scope--------------------------------directive---',scope);

                    var map = new google.maps.Map(elem[0], {
                        zoom: 10,
                        center: {lat: 37.090, lng: -95.712}
                    });

                    // Construct the circle for each value in citymap.
                    // Note: We scale the area of the circle based on the population.
                    // Add the circle for this city to the map.
                    var circle = new google.maps.Circle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: map,
                        center: {lat: 37.090, lng: -95.712},
                        radius: 1000,
                        editable: true
                    });
                    circle.addListener('radius_changed', function() {
                        scope.$apply(function(){
                            console.log('radius--------------------',circle.getRadius());
                            scope.ContentHome.geoAction=circle.getRadius();
                        });
                        console.log('City Circle Event called');
                        alert(circle.getRadius());
                    });
                    circle.addListener('center_changed', function() {
                        var newCenter=circle.getCenter();
                        console.log('center_changed Event called',newCenter.lat(),newCenter.lng());
                        map.panTo(circle.getCenter());
                        alert(circle.getRadius());
                    });

                    /*var geocoder = new google.maps.Geocoder();
                    var location;
                    scope.$watch('coordinates', function (newValue, oldValue) {
                        if (newValue) {
                            scope.coordinates = newValue;
                            if (scope.coordinates.length) {
                                var map = new google.maps.Map(elem[0], {
                                    center: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                                    zoomControl: false,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    zoom: 15,
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                });
                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(scope.coordinates[1], scope.coordinates[0]),
                                    map: map,
                                    draggable: true
                                });

                                var styleOptions = {
                                    name: "Report Error Hide Style"
                                };
                                var MAP_STYLE = [
                                    {
                                        stylers: [
                                            {visibility: "on"}
                                        ]
                                    }];
                                var mapType = new google.maps.StyledMapType(MAP_STYLE, styleOptions);
                                map.mapTypes.set("Report Error Hide Style", mapType);
                                map.setMapTypeId("Report Error Hide Style");
                            }
                            google.maps.event.addListener(marker, 'dragend', function (event) {
                                scope.coordinates = [event.latLng.lng(), event.latLng.lat()];
                                geocoder.geocode({
                                    latLng: marker.getPosition()
                                }, function (responses) {
                                    if (responses && responses.length > 0) {
                                        scope.location = responses[0].formatted_address;
                                        scope.draggedGeoData({
                                            data: {
                                                location: scope.location,
                                                coordinates: scope.coordinates
                                            }
                                        });
                                    } else {
                                        location = 'Cannot determine address at this location.';
                                    }

                                });
                            });
                        }
                    }, true);*/
                }
            }
        })
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        var val = $(element).val(),
                            regex = /^[0-9\-\., ]+$/g;
                        if (regex.test(val)) {
                            scope.$apply(function () {
                                scope.$eval(attrs.ngEnter);
                            });

                            event.preventDefault();
                        }
                    }
                });
            };
        })
})(window.angular,buildfire);