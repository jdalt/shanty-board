angular.module('svg.draggable', [])
.directive('draggable', ['$document', function($document) {
  return {
    restrict: 'A',
    scope: {
      onDragFinish: '&'
    },
    link: function($scope, element, attr) {
      var el = element[0]
      var svg = el.viewportElement
      if(svg == undefined) return;

      // Helper method
      function cursorPoint(evt) {
        var pt = svg.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
      }

      var elInitX, elInitY, mouseInitX, mouseInitY;
      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();

        elInitX = parseInt(el.getAttribute('x'))
        elInitY = parseInt(el.getAttribute('y'))

        var curPt = cursorPoint(event)
        mouseInitX = curPt.x
        mouseInitY = curPt.y

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        var curPt = cursorPoint(event)
        var deltaX = mouseInitX - curPt.x
        var deltaY = mouseInitY - curPt.y

        el.setAttribute('x', elInitX - deltaX)
        el.setAttribute('y', elInitY - deltaY)
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
