(function (angular, buildfire) {
    'use strict';
    if (!buildfire) {
        throw ("buildfire not found");
    }
    angular
        .module('geoFenceModals', ['ui.bootstrap'])
        .factory('Modals', ['$modal', '$q','$timeout', function ($modal, $q) {
            return {
                removePopupModal: function (info) {
                    var removePopupDeferred = $q.defer();
                    var removePopupModal = $modal
                        .open({
                            templateUrl: 'templates/modals/rm-section-modal.html',
                            controller: 'RemovePopupCtrl',
                            controllerAs: 'RemovePopup',
                            size: 'sm',
                            resolve: {
                                Info: function () {
                                    return info;
                                }
                            }
                        });
                    removePopupModal.result.then(function (imageInfo) {
                        removePopupDeferred.resolve(imageInfo);
                    }, function (err) {
                        //do something on cancel
                        removePopupDeferred.reject(err);
                    });
                    return removePopupDeferred.promise;
                }
            };
        }])
        .controller('RemovePopupCtrl', ['$scope', '$modalInstance', 'Info','$timeout', function ($scope, $modalInstance, Info,$timeout) {
           var RemovePopup=this;
            RemovePopup.showPopup=false;
            $timeout(function () {
                var top =  Info.event.pageY-50;
                $('.modal-dialog.modal-sm').offset({top: top, left: 0});
                RemovePopup.showPopup=true;
            }, 300);
            RemovePopup.ok = function () {
                $modalInstance.close('yes');
            };
            RemovePopup.cancel = function () {
                $modalInstance.dismiss('no');
            };
        }])
})(window.angular, window.buildfire);
