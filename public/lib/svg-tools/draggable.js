angular.module('svg.draggable', [])
.directive('draggable', ['$document', function($document) {
  return {
    restrict: 'A',
    scope: {
      onDragFinish: '&'
    },
    link: function($scope, element, attr) {
      var startX = 0, startY = 0;

      var el = element[0];
      // if(el.tagName.toLowerCase() != 'foreignObject') return;

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();

        var elX = parseInt(el.getAttribute('x'))
        var elY = parseInt(el.getAttribute('y'))

        startX = event.pageX - elX
        startY = event.pageY - elY

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        elX = event.pageX - startX;
        elY = event.pageY - startY;

        el.setAttribute('x', elX)
        el.setAttribute('y', elY)
      }

      function mouseup(event) {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);

        var pos = {
          element: el,
          event: event,
          x: parseInt(el.getAttribute('x')),
          y: parseInt(el.getAttribute('y'))
        }
        $scope.onDragFinish({position: pos})
      }
    }
  }
}]);
