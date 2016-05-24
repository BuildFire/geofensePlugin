describe('Unit : Controller - ContentHomeCtrl', function () {

// load the controller's module
    beforeEach(module('geoFencePluginContent'));

    var
        ContentHome, scope, Modals, DB, $timeout, COLLECTIONS, $q, Buildfire,Utils,DEFAULT_DATA;
    beforeEach(module('geoFencePluginContent', function ($provide) {
        $provide.service('Buildfire', function () {
            this.datastore = jasmine.createSpyObj('datastore', ['save', 'update', 'search']);
            this.datastore.update.and.callFake(function (_tagName, id, data, callback) {
                if (_tagName) {
                    callback(null, {
                        data: {
                            title:'Item1',
                            epicenter:{},
                            radius:2.12
                        }
                    });
                } else {
                    callback('Error', null);
                }
            });
            this.datastore.save.and.callFake(function (options, _tagName, callback) {
                if (_tagName) {
                    callback(null, [{
                        data: {
                            title:'Item1',
                            epicenter:{},
                            radius:2.12
                        }
                    }]);
                } else {
                    callback('Error', null);
                }
            });
            this.datastore.search.and.callFake(function (options, _tagName, callback) {
                if (_tagName) {
                    callback(null, [{
                        data: {
                            title:'Item1',
                            epicenter:{},
                            radius:2.12
                        }
                    }]);
                } else {
                    callback('Error', null);
                }
            });
        });
    }));

    beforeEach(inject(function ($controller, _Buildfire_, _$rootScope_, _Modals_, _DB_, _$timeout_, _COLLECTIONS_,_DEFAULT_DATA_, _Utils_,_$q_) {
            scope = _$rootScope_.$new();
            Modals = _Modals_;
            DB = _DB_;
            $timeout = _$timeout_;
            COLLECTIONS = _COLLECTIONS_;
            Buildfire = _Buildfire_;
            DEFAULT_DATA=_DEFAULT_DATA_;
            Utils=_Utils_;
            ContentHome = $controller('ContentHomeCtrl', {
                $scope: scope,
                Modals: Modals,
                DB: DB,
                $timeout: $timeout,
                COLLECTIONS: COLLECTIONS,
                Buildfire: Buildfire,
                DEFAULT_DATA:DEFAULT_DATA,
                Utils:Utils

            });
            $q = _$q_;
        })
    )
    ;

    describe('Units: units should be Defined', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(ContentHome).not.toBeUndefined();
        });
        it('it should pass if Modals is defined', function () {
            expect(Modals).not.toBeUndefined();
        });
        it('it should pass if DB is defined', function () {
            expect(DB).not.toBeUndefined();
        });
        it('it should pass if COLLECTIONS is defined', function () {
            expect(COLLECTIONS).not.toBeUndefined();
        });
    });

    describe('Unit: ContentHome.removeListItem', function () {
        var spy, removePopupModal;
        beforeEach(inject(function () {
            //Modals=jasmine.createSpyObj('Modals',['removePopupModal']);
            spy = spyOn(Modals, 'removePopupModal').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });

        }));

        it('it should do nothing if index is invalid', function () {
            ContentHome.items = ['test'];
            ContentHome.removeListItem(-1);
            expect(spy).not.toHaveBeenCalled();
        });

        it('it should work fine if index is valid', function () {
            ContentHome.items = ['test'];
            ContentHome.removeListItem(0);
            expect(spy).toHaveBeenCalled();//With({title:'test'});

        });

    });

    describe('Unit: ContentHome.getMore', function () {
        it('should do nothing when isBusy(fetching)', function () {
            ContentHome.isBusy = true;
            ContentHome.getMore();
        });

        it('should do nothing when noMore (all data loaded)', function () {
            ContentHome.noMore = false;
            ContentHome.getMore();
        });
    });
    describe('Unit: ContentHome.selectItem', function () {
        it('should select the item', function () {
            ContentHome.geoAction={data:{title:'preItem'}};
            ContentHome.selectItem({data:{title:'SelectedItem',radius:12,epicenter:{address:'itemAdd',coordinates:{lat:88,lng:99}}}});
            scope.$digest();
            expect(ContentHome.geoAction.data.title).toBe('SelectedItem');
        });
    });
    describe('Unit: ContentHome.addNewItem', function () {
        it('should empty all fields', function () {
            ContentHome.geoAction={data:{title:'preItem'}};
            ContentHome.addNewItem();
            scope.$digest();
            expect(ContentHome.geoAction.data.title).toBe('');
        });
    });
    describe('Unit: ContentHome.clearData', function () {
        it('should empty center lat/lng', function () {
            ContentHome.center={lat:23,lng:34};
            ContentHome.clearData();
            scope.$digest();
            expect(ContentHome.center.lat).toBe('');
        });
    });
    describe('Unit: ContentHome.setCoordinates', function () {
        it('should empty center lat/lng', function () {
            ContentHome.selectedLocation='23,42';
            ContentHome.setCoordinates();
            scope.$digest();
        });
    });
    describe('Unit: ContentHome.setLocation', function () {
        it('should empty center lat/lng', function () {
            ContentHome.selectedLocation='23,42';
            ContentHome.setLocation({location:'Delhi',coordinates:[63,44]});
            scope.$digest();
        });
    });
    describe('Unit: ContentHome.locationAutocompletePaste', function () {
        it('should empty center lat/lng', function () {
            ContentHome.selectedLocation='23,42';
            ContentHome.locationAutocompletePaste();
            scope.$digest();
        });
    });
    describe('Unit: ContentHome.updateRadius', function () {
        it('should empty center lat/lng', function () {
            ContentHome.radiusFeet='2342';
            ContentHome.radiusMiles='23';
            ContentHome.updateRadius();
            scope.$digest();
        });
    });
});