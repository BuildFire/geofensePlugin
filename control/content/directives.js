(function (angular) {
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
                link: function (scope, elem, attrs) {
                    var circle;
                    var map = new google.maps.Map(elem[0], {
                        zoom: 9,
                        center: {lat: 37.090, lng: -95.712}
                    });

                    attrs.$observe('googleMap', redrawTheCircle);
                    attrs.$observe('googleMapRadius', redrawTheCircle);

                    function calculateRadius(){
                        var radiusInMeters;
                        if((((scope.ContentHome.geoAction && scope.ContentHome.geoAction.data && parseFloat(scope.ContentHome.geoAction.data.radius)) || 10) * 1609.34 < 3.048) ){
                            radiusInMeters= 3.048;
                            scope.ContentHome.geoAction.data.radius=3.048/1609.34;
                            calculateRadiusInMilesAndFeet(scope.ContentHome.geoAction.data.radius);
                        }
                        else{
                            radiusInMeters=((scope.ContentHome.geoAction && scope.ContentHome.geoAction.data && parseFloat(scope.ContentHome.geoAction.data.radius)) || 10) * 1609.34;
                        }
                        return radiusInMeters;
                    }

                    function calculateRadiusInMilesAndFeet(radiusInMiles){
                        scope.ContentHome.radiusMiles=parseInt(radiusInMiles);
                        if(scope.ContentHome.radiusMiles){
                            scope.ContentHome.radiusFeet=parseInt((parseFloat(radiusInMiles)%scope.ContentHome.radiusMiles)*5280);
                        }
                        else{
                            scope.ContentHome.radiusFeet=parseInt(parseFloat(radiusInMiles)*5280);
                        }
                    }

                    function redrawTheCircle(newVal, oldVal) {
                        if (circle)
                            circle.setMap(null);
                        circle = new google.maps.Circle({
                            strokeColor: '#09a3ee',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#09a3ee',
                            fillOpacity: 0.35,
                            map: map,
                            center: (scope.ContentHome.center && scope.ContentHome.center.lat && scope.ContentHome.center.lng && scope.ContentHome.center) || ({"lat":32.715738,"lng":-117.16108380000003}),
                            radius: calculateRadius(),
                            editable: true
                        });
                        if (map && circle)
                            map.panTo(circle.getCenter());
                        circle.addListener('radius_changed', function () {
                            scope.$apply(function () {
                                scope.ContentHome.geoAction.data.radius = (circle.getRadius()/1609.34);
                                calculateRadiusInMilesAndFeet(scope.ContentHome.geoAction.data.radius);
                            });
                            console.info('Circle radius_changed Event called');
                        });
                        circle.addListener('center_changed', function () {
                            var newCenter = circle.getCenter();
                            console.info('center_changed Event called',newCenter, newCenter.lat(), newCenter.lng());
                            scope.ContentHome.center = {lat: newCenter.lat(), lng: newCenter.lng()};
                            scope.$apply(function(){
                                scope.ContentHome.selectedLocation=newCenter.lat()+','+newCenter.lng();
                                scope.ContentHome.geoAction.data.epicenter.address=scope.ContentHome.selectedLocation;
                                scope.ContentHome.geoAction.data.epicenter.coordinates=scope.ContentHome.center;
                            });
                            map.panTo(circle.getCenter());
                        });
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
})(window.angular);