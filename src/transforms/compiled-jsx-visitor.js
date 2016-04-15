var globalUtils = require('./utils');
var utility = require('jstransform/src/utils');

function classVisitor (traverse, node, path, state) {
  if (path[0].type === 'AssignmentExpression' ) {
    return true
  }
  const nameObject = path[0].arguments[0]
  const requirePath = state.g.requireNodesMap &&
  state.g.requireNodesMap[nameObject.name];
  if (state.g.opts.doNotInstrument !== true && requirePath &&
    !globalUtils.doNotWrap[nameObject.name]) {
    utility.append('React.createElement(', state);
    utility.append('__electronHot__.register(', state);
    utility.move(nameObject.range[0], state);
    utility.catchup(nameObject.range[1], state);
    utility.append(", require.resolve('" + requirePath.replace(/\\/g, '/') + "'))", state);
    return false
  }
  // debugger
  return true
}

classVisitor.test = function (node, path, state) {
  return (
    node.type === "MemberExpression" &&
    node.object.name === "React" &&
    node.property.name === "createElement"
  );
};

module.exports = classVisitor;
