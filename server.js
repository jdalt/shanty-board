var express = require('express');
var monk = require('monk');
var db =  monk('localhost:27017/erd');
var app = new express();
var bodyParser = require('body-parser')
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

app.post('/erd', function (req, res) {
  console.log('post received');
  var collection = db.get('erd');
  collection.insert(req.body, function(err, data) {
    if(err) {
      console.log('error', err);
      res.json({status: "error", error: err});
    } else {
      console.log('success');
      res.json({status: "success"});
    }
  });
});

app.put('/erd/:name', function (req, res) {
  console.log('post received');
  var collection = db.get('erd');
  collection.update( { name: req.params.name }, req.body, {upsert: true}, function(err, data) {
    if(err) {
      console.log('error', err);
      res.json({status: "error", error: err});
    } else {
      console.log('success');
      res.json({status: "success"});
    }
  });
});

var port = Number(process.env.PORT || 3000);
app.listen(port);
