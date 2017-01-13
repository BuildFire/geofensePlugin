/**
 * Created by intelligrape on 24/5/16.
 */
describe('Unit testing Directives', function() {
    var $compile,
        $rootScope;

    // Load the myApp module, which contains the directive
    beforeEach(module('geoFencePluginContent'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('Replaces the element with the appropriate content', function() {
        // Compile a piece of HTML containing the directive
        var element = $compile("<input google-location-search='' />")($rootScope);
        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        // expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });
    xit('Replaces the element with the appropriate googleMap content', function() {
        // Compile a piece of HTML containing the directive
        var element = $compile("<div google-map=''></div>")($rootScope);
        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        // expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });
    it('Replaces the element with the appropriate googleMap content', function() {
        // Compile a piece of HTML containing the directive
        var element = $compile("< ng-enter=''/>")($rootScope);
        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        // expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });
});