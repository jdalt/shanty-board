angular.module('models', ['js-data'])
.factory('ErdBlob', function(DS) {
  return DS.defineResource({
    name: 'erd-blob',
    endpoint: '/erd-blob'
  })
})
.factory('App', function(DS) {
  return DS.defineResource({
    name: 'app',
    relations: {
      hasMany: {
        entity: {
          localFeild: 'entities',
          foreignKey: 'app'
        }
      }
    }
  })
})
.factory('Entity', function(DS, App) { // Depend on App
  return DS.defineResource({
    idAttribute: 'name',
    name: 'entity',
    endpoint: '/entities',
    relations: {
      belongsTo: {
        app: {
          parent: true,
          localKey: 'app',
        }
      }
    }
  })
})
