(function (angular) {
    "use strict";
    angular
        .module('geoFenceEnums', [])
        .constant('MESSAGES', {
            ERROR: {
                NOT_FOUND: "No result found",
                CALLBACK_NOT_DEFINED: "Callback is not defined",
                ID_NOT_DEFINED: "Id is not defined",
                DATA_NOT_DEFINED: "Data is not defined",
                OPTION_REQUIRES: "Requires options"
            }
        })
        .constant('COLLECTIONS', {
            GeoActions: "geoActions",
            GeoInfo:"geoInfo"
        })
        .constant('GOOGLE_KEYS', {
            API_KEY: 'AIzaSyC4Dw4EzKeyVBXWBsbO9-UgyEARL6WLrlU'
        });
})(window.angular);