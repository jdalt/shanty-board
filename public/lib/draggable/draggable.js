angular.module('draggable', [])
.directive('draggable', ['$document', function($document) {
  return function($scope, element, attr) {
    var startX = 0, startY = 0;

    var firstChild = element.children()[0];
    element.on('mousedown', function(event) {
      if(event.srcElement == event.currentTarget || event.srcElement == firstChild) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - $scope.thought.x;
        startY = event.pageY - $scope.thought.y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }
    });

    function mousemove(event) {
      $scope.thought.y = event.pageY - startY;
      $scope.thought.x = event.pageX - startX;
      $scope.$apply();
    }

    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);

      persistContextPosition($scope.thought);
      $scope.$apply();
    }

    function persistContextPosition(thought) {
      thought.put().then( function(thought) {
        console.log("update success");
      }, function(err) {
        console.log("fail to put", err);
      });
    }
  };
}]);
