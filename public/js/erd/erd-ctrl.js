angular.module('erd')
.controller('ErdCtrl', function($scope) {
  var ctrl = this
  ctrl.test = "hello"

  ctrl.sayHi = function(element) {
    console.log('el', element)
    console.log('drag finish')
  }
})

