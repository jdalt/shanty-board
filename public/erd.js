var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
  el: $('#paper'),
  width: 2500,
  height: 2500,
  gridSize: 1,
  model: graph
});

var zoomFactor = 1;
function zoomIn() {
  zoomFactor *= 1.1;
  paper.scale(zoomFactor, zoomFactor);
}
function zoomOut() {
  zoomFactor *= .9;
  paper.scale(zoomFactor, zoomFactor);
}

var erd = joint.shapes.erd;

var MAX_WIDTH = 2500;
var MODEL_WIDTH = 150;
var MODEL_HEIGHT = 250;
var OFFSET = 50
var nx = 0;
var ny = 0;
function nextX() {
  if(nx + MODEL_WIDTH + OFFSET < MAX_WIDTH) {
    nx += MODEL_WIDTH + OFFSET;
  } else {
    nx = 0;
    ny += MODEL_HEIGHT + OFFSET;
  }
  return nx;
}
function nextY() {
  return ny;
}

var element = function(elm, model, label) {
  var position = model.position || { x: nextX(), y: nextY() }
  var cell = new elm({ position: position, attrs: { '.klass': { text: label }}});

  // type, relationshipType, class, accessor
  var relLi = _.map(model.relations, function(relation) {
    var cssClasses = relation.relationshipType + ' ' + relation.type;
    return '<li class="' + relation.type +'"><img class="relation" src="img/' + relation.relationshipType + '.svg" />' + relation.accessor + ' [' + relation.class + ']</li>';
  });

  var childrenHtml = model.children.length > 0 ?  '<div class="info"> Children: ' + model.children + '</div>' : '';

  var html =
    '<h4 class="header ' + model.db + '">' + model.name + '</h4>' +
    '<div class="content ' + model.db + '">' +
      '<div class="info">' + (model.table || model.collection) + '</div>' +
      childrenHtml +
      '<h5>Relations</h5>' +
      '<ul class="relations">' + relLi.join('') + '</ul>' +
      '<h5>Attributes</h5>' +
      '<ul><li>' + model.fields.join('</li><li>') + '</li></ul>' +
    '</div>';

  var styleSheet = '<link href="style.css" type="text/css" rel="stylesheet" xmlns="http://www.w3.org/1999/xhtml"/>';
  var markup = '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><foreignObject class="node" width="' +  MODEL_WIDTH + '" height="' + MODEL_HEIGHT + '">' + styleSheet + '<body class="erd-model" xmlns="http://www.w3.org/1999/xhtml">' + html + '</body></foreignObject></g>';
  cell.markup = markup;
  graph.addCell(cell);
  return cell;
};

var link = function(elm1, elm2) {
  var myLink = new erd.Line({ source: { id: elm1.id }, target: { id: elm2.id }});
  graph.addCell(myLink);
  return myLink;
};

// Put all models in a hash based class name.
function processModels(models) {
  var classJointHash = {}
  _.each(models, function(model) {
    classJointHash[model.name] = model;
  });
  return classJointHash;
}

function makeJointModels(models, classJointHash) {
  _.each(models, function(model) {
    model.jointModel = element(erd.Entity, model, model.name);
  });

  // Link all relationships
  _.each(models, function(model) {
    _.each(model.relations, function(relation) {
      var relateModel = classJointHash[relation.class]
      if(relateModel) {
        link(model.jointModel, relateModel.jointModel).cardinality(relation.relationshipType)
      }
    });
  });
}

var currentModels;
function createModels(data, textStatus, jqXHR) {
  console.log(data);
  var models = data.models || data
  var cjh = processModels(models);
  makeJointModels(models, cjh);
  currentModels = models;
}

function loadFile() {
  var url = '/' + $('#loadFile').val() + '.json';
  loadJson(url);
}

function loadDb() {
  var url = '/erd/' + $('#db-name').val();
  loadJson(url);
}

function loadJson(url) {
  graph.clear();
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    success: createModels
  });
}

function save() {
  if(!currentModels) { return; }
  _.each(currentModels, function(model) {
    model.position = model.jointModel.attributes.position;
  });

  var cleanModels = _.map(currentModels, function(model) {
    return _.omit(model, "jointModel");
  });

  var save_name = $('#db-name').val();
  var postData = { name: save_name, models: cleanModels };
  $.ajax({
    url: '/erd/' + save_name,
    type: 'PUT',
    data: JSON.stringify(postData),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    success: function(data, textStatus, jqXHR) { console.log('success') }
  });
}

loadDb();
