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

// Put all models in a hash based class name.
var classJointHash = {}
_.each(statNginModels, function(model) {
  classJointHash[model.name] = model;
});

console.log(classJointHash);

function tourneyDist(model, depth) {
  model.depth = depth;
  _.each(model.relations, function(relation) {
    switch(relation.relationshipType) {
      case "embedded_in":
      case "referenced_in":
        return;
    }
    var relateModel = classJointHash[relation.class]
    if(relateModel && relateModel.depth == null) {
      tourneyDist(relateModel, depth + 1);
    }
  });
}

tourneyDist(classJointHash["Tournament"], 0);

// Check all the child classes.
_.each(classJointHash, function(model) {
  if(model.depth != null)
    return;

  var supers = _.map(model.superClasses, function(superName) { return classJointHash[superName] });
  if(supers.length < 1)
    return;

  var bestSuper = _.find(supers, function(sup) { return sup.depth != null });
  if(bestSuper) {
    tourneyDist(model, bestSuper.depth);
  }
});

var depthCount = {};
for(var i=0; i<25; i++) {
  depthCount[i] = 0;
}
depthCount[-1] = 0;

var x_cord = 10;
var y_cord = 10;
_.each(statNginModels, function(model) {
  if(model.depth == null) {
    model.depth = -1;
  }
  x_cord = depthCount[model.depth] * 160; // TODO: const
  if(model.depth == -1) {
    y_cord = 7 * 300;
  } else {
    y_cord = model.depth * 300; // TODO: const
  }

  var jointModel = element(erd.Entity, model, x_cord, y_cord, model.name);
  model.jointModel = jointModel;

  depthCount[model.depth]++;
});

_.each(statNginModels, function(model) {
  _.each(model.relations, function(relation) {
    var relateModel = classJointHash[relation.class]
    if(relateModel) {
      link(model.jointModel, relateModel.jointModel).cardinality(relation.relationshipType)
    }
  });
});
