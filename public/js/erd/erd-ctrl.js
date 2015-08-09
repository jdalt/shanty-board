angular.module('erd')
.controller('ErdCtrl', function($scope, ErdBlob) {
  var ctrl = this

  ErdBlob.find('stat_ngin').then(function(erdBlob) {
    ctrl.models = erdBlob.models
    ctrl.dbName = erdBlob.name
  })

  ctrl.sayHi = function(element) {
    console.log('el', element)
    console.log('drag finish')
  }
})

