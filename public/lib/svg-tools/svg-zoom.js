angular.module('svg.zoom', [])
.directive('svgZoom', [function() {
  return function($scope, element, attr) {
    var el = element[0];
    var svg = el.viewportElement

    // if(svg.tagName.toLowerCase() != 'svg') return;

    // TODO: break out as service Helper method
    function cursorPoint(evt) {
      var pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function setTransform(element, matrix) {
      var s = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' + matrix.d + ',' + matrix.e + ',' + matrix.f + ')';
      element.setAttribute('transform', s);
    }

    var zoomLevel = 1
    var repeat = .1
    function zoom(event) {
      var delta = event.deltaY; // check cross browser situation
      var oldZoomLevel = zoomLevel || 1
      if(delta < 0) {
        zoomLevel = zoomLevel * (1 - repeat)
      } else {
        zoomLevel *= (1 + repeat)
      }
      var zoomRelative = zoomLevel/oldZoomLevel

      var point = svg.createSVGPoint()
      point.x = event.clientX
      point.y = event.clientY
      var oldCTM = el.getCTM()
        , relativePoint = point.matrixTransform(oldCTM.inverse())
        , modifier = svg.createSVGMatrix().translate(relativePoint.x, relativePoint.y).scale(zoomRelative).translate(-relativePoint.x, -relativePoint.y)
        , newCTM = oldCTM.multiply(modifier)
      setTransform(el, newCTM)
    }

    svg.onmousewheel = zoom
  }
}])
