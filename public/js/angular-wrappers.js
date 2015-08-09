(function() {
angular.module('util.wrappers', []);
angular.module('util.wrappers')
  .factory('_', function($window) {
    var _ = _ || $window._;
    return _;
  })
})();
