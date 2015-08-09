angular.module('svg.heightUpdater', [])
.directive('hasChildHeight', [function() {

  function link($scope, element, attr) {
    // check for foreignObject tag?

    var sourceElement = element[0];
    var heightTarget = element.children()[0];
    sourceElement.setAttribute('height', parseInt(heightTarget.scrollHeight));

    $scope.$watch(function() {
      return heightTarget.scrollHeight;
    }, function(newHeight) {
      sourceElement.setAttribute('height', newHeight);
    });
  }

  return {
    link: link
  }

}]);

