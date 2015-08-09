angular.module('draggable', [])
.directive('draggable', ['$document', function($document) {
  return {
    restrict: 'A',
    link: function($scope, element, attr) {
      var startX = 0, startY = 0;

      var el = element[0];
      var firstChild = element.children()[0];
      // if(el.tagName.toLowerCase() != 'foreignObject') return;

      element.on('mousedown', function(event) {
        if(event.srcElement == event.currentTarget || event.srcElement == firstChild) {
          // Prevent default dragging of selected content
          event.preventDefault();

          var elX = parseInt(el.getAttribute('x'))
          var elY = parseInt(el.getAttribute('y'))

          startX = event.pageX - elX
          startY = event.pageY - elY

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }
      });

      function mousemove(event) {
        elX = event.pageX - startX;
        elY = event.pageY - startY;

        el.setAttribute('x', elX)
        el.setAttribute('y', elY)
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
        // TODO: invoke callback
      }
    }
  }
}]);
