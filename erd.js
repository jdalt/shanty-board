var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
  el: $('#paper'),
  width: 2500,
  height: 2500,
  gridSize: 1,
  model: graph
});

var erd = joint.shapes.erd;

var element = function(elm, model, x, y, label) {
  var cell = new elm({ position: { x: x, y: y }, attrs: { '.klass': { text: label }}});

  var html = '<h4>' + model.name + '</h4><ul><li>' + model.fields.join('</li><li>') + '</li></ul>';
  var markup = '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><foreignObject class="node" width="150" height="250"><body xmlns="http://www.w3.org/1999/xhtml">' + html + '</body></foreignObject></g>';
  cell.markup = markup;
  graph.addCell(cell);
  return cell;
};

var link = function(elm1, elm2) {
  var myLink = new erd.Line({ source: { id: elm1.id }, target: { id: elm2.id }});
  graph.addCell(myLink);
  return myLink;
};

var x_cord = 10;
var y_cord = 10;
var classJointHash = {}
_.each(statNginModels, function(model) {
  var jointModel = element(erd.Entity, model, x_cord, y_cord, model.name);
  classJointHash[model.name] = jointModel;
  model.jointModel = jointModel;
  if(x_cord < 1200) {
    x_cord += 200;
  } else {
    y_cord += 75;
    x_cord = 10;
  }
});

_.each(statNginModels, function(model) {
  _.each(model.relations, function(relation) {
    var relateModel = classJointHash[relation.class]
    if(relateModel) {
      link(model.jointModel, relateModel).cardinality(relation.relationshipType)
    }
  });
});

