angular.module('erd-blob', ['js-data'])
.factory('ErdBlob', function(DS) {
  return DS.defineResource({
    name: 'erd-blob',
    endpoint: '/erd-blob'
  })
});

