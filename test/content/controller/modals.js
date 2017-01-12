describe('geoFenceModals: Services', function () {
    var $modal, $q;
    beforeEach(module('geoFenceModals'));
    beforeEach(inject(function ($injector) {
        $q = $injector.get('$q');
    }));

    describe('Modals service', function () {
        var Modals;
        $modal = jasmine.createSpyObj('$modal', ['open']);
        beforeEach(inject(
            function (_Modals_) {
                Modals = _Modals_;
            }));
        it('Modals should exists', function () {
            expect(Modals).toBeDefined();
        });
        it('Modals.removePopupModal should exists', function () {
            expect(Modals.removePopupModal).toBeDefined();
        });
        it('when $modal.open invoked by removePopupModal and clicked Ok', function () {
            $modal.open.and.callFake(function (obj) {
                var deferred = $q.defer();
                obj.resolve.Info();
                deferred.resolve({});
                return {
                    result: deferred.promise
                };
            });
            Modals.removePopupModal({
                templateUrl: 'templates/modals/rm-section-modal.html',
                controller: 'RemovePopupCtrl',
                controllerAs: 'RemovePopup',
                size: 'sm',
                resolve: {
                    Info: function () {
                        return {};
                    }
                }
            });
        });
    });

    describe('Modals: RemovePopupCtrl Controller', function () {
        var $scope, $modalInstance, Info, spy,RemovePopup;
        beforeEach(inject(function ($controller, _$rootScope_, _$modal_) {
                $scope = _$rootScope_.$new();
                modalInstance = {                    // Create a mock object using spies
                    close: jasmine.createSpy('modalInstance.close'),
                    dismiss: jasmine.createSpy('modalInstance.dismiss'),
                    result: {
                        then: jasmine.createSpy('modalInstance.result.then')
                    }
                };
                Info = {event:{}};
                RemovePopup = $controller('RemovePopupCtrl', {
                    $scope: $scope,
                    $modalInstance: modalInstance,//_$modal_.op,
                    Info: Info
                });
            })
        );
        it('$scope should exists', function () {
            expect(RemovePopup).toBeDefined();
        });
        it('$scope.cancel should exists', function () {
            expect(RemovePopup.cancel).toBeDefined();
        });
        it('$scope.ok should exists', function () {
            expect(RemovePopup.ok).toBeDefined();
        });
        it('$scope.cancel should exists', function () {
            expect(RemovePopup.cancel).toBeDefined();
        });
        it('$scope.ok should close modalInstance', function () {
            RemovePopup.ok();
            expect(modalInstance.close).toHaveBeenCalledWith('yes');
        });
        it('$scope.ok should dismiss modalInstance', function () {
            RemovePopup.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('no');
        });
    });
});