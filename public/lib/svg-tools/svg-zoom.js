angular.module('svg.tools', [])
.directive('svgZoom', [function() {
  return function($scope, element, attr) {
    var el = element[0];
    if(el.tagName.toLowerCase() != 'svg') return;

    function zoom(event) {
      svgEl = event.currentTarget;

      var delta = event.deltaY; // check cross browser situation
      var flipper = 1;
      if(delta < 0) flipper = -1;

      var viewBox = svgEl.viewBox.baseVal;
      viewBox.height = viewBox.height + viewBox.height * .1 * flipper;
      viewBox.width = viewBox.width + viewBox.width * .1 * flipper;
      svgEl.setAttribute('viewBox', viewBoxStr(viewBox));
    }

    function viewBoxStr(vb) {
      return vb.x +' '+ vb.y +' '+ vb.width +' '+ vb.height;
    }

    element.on('wheel', zoom);
  }
}])

