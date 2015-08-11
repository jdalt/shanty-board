angular.module('erd')
.directive('entity', function(TemplateUtil) {
  return {
    restrict: 'A',
    scope: {
      entity: '='
    },
    templateUrl: TemplateUtil.url('erd/entity-directive-tmpl.html'),
    controller: function($scope, Entity) {

      $scope.move = function(move) {
        $scope.entity._meta.x = move.x
        $scope.entity._meta.y = move.y
        Entity.save($scope.entity.name).then( function(res) {
          console.log('success')
        })
      }

    }
  }
})
