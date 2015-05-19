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

  var childrenLi = _.map(model.children, function(child) {
    return '<li><h5>' + child + '</h5></li>';
  });

  var html =
    '<h4 class="header ' + model.db + '">' + model.name + '</h4>' +
    '<ul class="child-klasses">' + childrenLi.join('') + '</ul>' +
    '<div class="content ' + model.db + '">' +
      '<div class="info">' + (model.table || model.collection) + '</div>' +
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

var hasMany = { d: 'M 10 5 L 0 0 M 10 5 L 0 5 L 10 5 L 0 10 z', fill: 'none', 'stroke-width': '2px' };
var embedsMany = { d: 'M 9,5 L 1,1 M 9,5 L 1,5 M 9,5 L 1,9 M 0,0 L 10,0 L 10,10 L 0,10 L 0,0 M 10,5 z', fill: 'none', 'stroke-width': '1.5px' };
var embedsOne = { d: 'M 0,0 L 10,0 L 10,10 L 0,10 z', fill: 'none', 'stroke-width': '1.5px' };
var embeddedIn = { d: 'M 0,0 L 10,0 L 10,10 L 0,10 z', fill: '#000'};
var belongsTo = { d: 'M -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0', fill: '#000' };
var hasOne = { d: 'M -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0', fill: 'none', 'stroke-width': '2px' };

var linkDecoration = {
  has_many: hasMany,
  embeds_many: embedsMany,
  embeds_one: embedsOne,
  embedded_in: embeddedIn,
  belongs_to: belongsTo,
  belongs_to_record: belongsTo,
  belongs_to_document: belongsTo,
  referenced_in: belongsTo,
  has_one: hasOne,
  references_one: hasOne,
  references_many: hasMany,
  references_and_referenced_in_many: hasMany,
  has_many_documents: hasMany,
  has_many_records: hasMany,
}

var link = function(linkDesc) {

  var sourceDecoration = linkDecoration[linkDesc.r1] || {};
  var targetDecoration = linkDecoration[linkDesc.r2] || {};
  console.log('source', sourceDecoration, 'target', targetDecoration);
  if(JSON.stringify(sourceDecoration) == '{}') debugger;
  var myLink = new erd.Line({
    source: { id: linkDesc.m1 },
    target: { id: linkDesc.m2 },
    attrs: {
      '.marker-source': sourceDecoration,
      '.marker-target': targetDecoration
    }
  });

  // myLink.set('router', { name: 'manhattan' });
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
  var linkHashMap = {};
  _.each(models, function(model) {
    _.each(model.relations, function(relation) {
      var relatedModel = classJointHash[relation.class]
      if(relatedModel) {
        var reverseRelation = _.find(relatedModel.relations, function(relation) {
          return relation.class == model.name;
        });
        var reverseType = 'unknown';
        if(reverseRelation) reverseType = reverseRelation.relationshipType;

        var m1 = model.jointModel.id;
        var m2 = relatedModel.jointModel.id;
        var r1 = relation.relationshipType;
        var r2 = reverseType;
        // HackishHashMap
        var desc = JSON.stringify({ m1: m1, r1: r1, m2: m2, r2: r2 });
        var desc_reverse = JSON.stringify({ m1: m2, r1: r2, m2: m1, r2: r1 });
        if(!linkHashMap[desc] && !linkHashMap[desc_reverse]) {
          linkHashMap[desc] = true;
        }
      }
    });
  });

  // deserialize pando's box, and link each descriptior
  var links = _.keys(linkHashMap).map(function(a) { return JSON.parse(a); });
  _.each(links, function(linkDesc) {
    link(linkDesc);
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
