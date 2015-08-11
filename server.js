var express = require('express');
var monk = require('monk');
var db =  monk('localhost:27017/erd');
var app = new express();
var bodyParser = require('body-parser')
var _ = require('lodash')

app.use(bodyParser.json({limit: '50mb'}))

app.use(express.json());

app.use(express.static(__dirname + '/public'));

db.get('erd').index('name', { unique: true });

app.get('/erd-blob/:id', function (req, res) {
  console.log('get /erd received');
  var collection = db.get('erd');
  collection.findOne( { id: req.params.id }, function(err, data) {
    if(err) {
      res.json({status: 'error'});
    } else {
      res.json(data);
    }
  });
});

app.get('/app/:app/entities', function (req, res) {
  console.log('get /models received');

  db.get('meta-models').find( { app: req.params.app }, function(err, metaModels) {
    if(err) {
      res.json({status: 'error'});
    } else {
      var metaModelHash = {}
      _.each(metaModels, function(meta) {
        return metaModelHash[meta.name] = _.omit(meta, ['app', 'name', '_id'])
      })
      getModelsAndZip(app, metaModelHash, res)
    }
  });
});

function getModelsAndZip(app, metaHash, res) {
  var modelsCollection = db.get('models');
  modelsCollection.find({ app: app }, function(err, models) {
    if(err) {
      res.json({status: 'error'});
    } else {
      var zippedModels = _.map(models, function(model) {
        model._meta = metaHash[model.name]
        return model
      })
      res.json(zippedModels)
    }
  });
}

app.post('/erd', function (req, res) {
  console.log('post received');
  var collection = db.get('models');
  console.log(req.body.models);

  var app = req.body.app
  var version = req.body.version
  var denormModels = _.map(req.body.models, function(model) {
    model.app = app
    model.version = version
    return model
  })
  collection.insert(denormModels, function(err, data) {
    if(err) {
      console.log('error', err);
      res.json({status: "error", error: err});
    } else {
      console.log('success');
      insertMeta(denormModels, res)
    }
  });
});

function insertMeta(models, res) {
  var collection = db.get('meta-models');
  var metaModels = _.map(models, function(model) {
    return {
      name: model.name,
      app: model.app,
      x: model.position.x,
      y: model.position.y
    }
  })

  collection.insert(metaModels, function(err, data) {
    if(err) {
      console.log('error', err);
      res.json({status: "error", error: err});
    } else {
      console.log('success');
      res.json({status: "success"});
    }
  });

}

app.put('/app/:app/entities/:name', function (req, res) {
  console.log('post received');
  var collection = db.get('meta-models');
  var meta = req.body._meta
  meta.app = req.body.app
  meta.name = req.body.name
  collection.update( { name: req.params.name, app: req.params.app }, meta, {upsert: true}, function(err, data) {
    if(err) {
      console.log('error', err);
      res.json({status: "error", error: err});
    } else {
      console.log('success');
      res.json(req.body)
    }
  });
});

var port = Number(process.env.PORT || 3000);
app.listen(port);
