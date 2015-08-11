angular.module('erd')
.controller('ErdCtrl', function($scope, Entity) {
  var ctrl = this

  Entity.findAll({app: 'stat_ngin'}).then(function(entities) {
    ctrl.models = entities
  })
})

