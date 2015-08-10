angular.module('erd')
.directive('entity', function(TemplateUtil) {
  return {
    restrict: 'A',
    scope: {
      entity: '='
    },
    templateUrl: TemplateUtil.url('erd/entity-directive-tmpl.html'),
    controller: function($scope) {

    }
  }
})
