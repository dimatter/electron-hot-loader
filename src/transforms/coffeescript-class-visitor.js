var globalUtils = require('./utils');

function classVisitor(traverse, node, path, state) {
  const name = path[1].left.name
  const requirePath = '__filename';
  globalUtils.addElementToGlobalMap(state, 'reactClasses', name, requirePath);
}

classVisitor.test = function (node, path, state) {
  return (node.type === "MemberExpression" && node.object && node.object &&
    node.object.name === "React" && node.property &&
    node.property.name === "Component" && path[0] && path[0].callee &&
    path[0].callee.params[0] && path[0].callee.params[0].name === 'superClass'
  )
}

module.exports = classVisitor;
