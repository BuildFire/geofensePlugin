(function (angular, buildfire) {
    "use strict";
    angular
        .module('geoFencePluginContent')
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
                            console.log('scope.setLocationInController-------in directive-------', location, coordinates);
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
        .directive("googleMap", ['$timeout', function ($timeout) {
            return {
                template: "<div></div>",
                /*replace: true,
                 scope: {coordinates: '=', draggedGeoData: '&draggedFn'},*/
                link: function (scope, elem, attrs) {
                    var circle;

                    buildfire.geo.getCurrentPosition(function (err, data) {
                        console.log('getCurrentPosition data------', data, 'getCurrentPosition----err-----', err);
                    });

                    console.log('elem--------------------------------directive---', elem);
                    console.log('attrs--------------------------------directive---', attrs);
                    console.log('scope--------------------------------directive---', scope);

                    var map = new google.maps.Map(elem[0], {
                        zoom: 10,
                        center: {lat: 37.090, lng: -95.712}
                    });

                    // Construct the circle for each value in citymap.
                    // Note: We scale the area of the circle based on the population.
                    // Add the circle for this city to the map.


                    attrs.$observe('googleMap', redrawTheCircle);


                    /*scope.$observe()$watch(function () {
                     return scope.ContentHome.center;
                     }, redrawTheCircle, true);*/

                    function redrawTheCircle(newVal, oldVal) {
                        console.log('GoogleMap---------------------------', newVal, oldVal);
                        if (circle)
                            circle.setMap(null);
                        circle = new google.maps.Circle({
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#FF0000',
                            fillOpacity: 0.35,
                            map: map,
                            center: (scope.ContentHome.center && scope.ContentHome.center.lat && scope.ContentHome.center.lng && scope.ContentHome.center) || ({"lat":32.715738,"lng":-117.16108380000003}),
                            radius: (scope.ContentHome.geoAction && scope.ContentHome.geoAction.data && parseInt(scope.ContentHome.geoAction.data.radius)) || 1000,
                            editable: true
                        });
                        if (map && circle)
                            map.panTo(circle.getCenter());
                        circle.addListener('radius_changed', function () {
                            scope.$apply(function () {
                                console.log('radius--------------------', circle.getRadius());
                                scope.ContentHome.geoAction.data.radius = circle.getRadius();
                            });
                            console.log('City Circle Event called');
                            alert(circle.getRadius());
                        });
                        /* $timeout(function(){
                         circle.setMap(null);
                         },5000);*/
                        circle.addListener('center_changed', function () {
                            var newCenter = circle.getCenter();
                            console.log('center_changed Event called',newCenter, newCenter.lat(), newCenter.lng());
                            scope.ContentHome.center = {lat: newCenter.lat(), lng: newCenter.lng()};
                            scope.$apply(function(){
                                scope.ContentHome.selectedLocation=newCenter.lat()+','+newCenter.lng();
                            });
                            map.panTo(circle.getCenter());
                            alert(circle.getRadius());
                        });
                        console.log('cenetr changed-----------------------------------------------', scope.ContentHome.center);
                    }

                }
            }
        }])
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13 && element && element.length) {
                        var val = element[0].value,
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
})(window.angular, buildfire);