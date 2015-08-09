angular.module('svg.pan', [])
.directive('svgPan', [function() {
  return function($scope, element, attr) {
    var el = element[0];
    if(el.tagName.toLowerCase() != 'svg') return;

    var viewWidth = parseInt(el.getAttribute('width'));
    var viewHeight = parseInt(el.getAttribute('height')); // might not be safe for % height (might need calculated height?)

    var moving = false;
    var startX, startY;
    var baseX, baseY;

    var initialVal = el.viewBox.baseVal;
    if(!initialVal || initialVal.x == null || initialVal.y == null || !initialVal.width || !initialVal.height) {
      el.setAttribute('viewBox', viewBoxStr({x:0, y:0, width: viewWidth, height: viewHeight}));
    }

    function startTranslation(event) {
      if(event.currentTarget == event.srcElement) { // don't start pan for child elements
        moving = true;
        startX = event.clientX
        startY = event.clientY

        var viewBox = event.currentTarget.viewBox.baseVal;
        baseX = viewBox.x;
        baseY = viewBox.y;
      }
    }

    function endTranslation() {
      moving = false;
    }

    function updateTranslation(event) {
      if(moving) {
        var deltaX = startX - event.clientX
        var deltaY = startY - event.clientY

        var svgEl = event.currentTarget;
        var viewBox = svgEl.viewBox.baseVal;
        var aspectX = viewBox.width / viewWidth;
        var aspectY = viewBox.height / viewHeight;

        viewBox.x = baseX + deltaX * aspectX;
        viewBox.y = baseY + deltaY * aspectY;
        svgEl.setAttribute('viewBox', viewBoxStr(viewBox));
      }
    }

    function viewBoxStr(vb) {
      return vb.x +' '+ vb.y +' '+ vb.width +' '+ vb.height;
    }

    element.on('mousedown', startTranslation);
    element.on('mouseup', endTranslation);
    element.on('mouseleave', endTranslation);
    element.on('mousemove', updateTranslation);
  }
}])

