var utils = require('jstransform/src/utils');
var globalUtils = require('./utils');
var proxiesPath = require.resolve('../proxies').replace(/\\/g, '/');

function requireVisitor (traverse, node, path, state) {
  if (!path[1].expression) {
    // console.debug(node)
    return true
  }
  const requirePath = node.arguments[0].value
  const identifier = path[1].expression.left.name

  if (!state.g.alreadyAddedElectronHotRequire) {
    utils.append("undefined;\nvar __electronHot__ = require('" + proxiesPath + "');\n" + identifier + " = ", state);
    state.g.alreadyAddedElectronHotRequire = true;
  }


  if (isOwnComponent(requirePath)) {
    globalUtils.addElementToGlobalMap(state, 'requireNodesMap', identifier, requirePath);
  }

  utils.catchup(node.range[1], state);
}
requireVisitor.test = function (node, path, state) {
  // bail out if we encounter a declaration... even if followed
  // by require. CoffeeScript hoists
  if (path[1] && path[1].type  == 'VariableDeclaration' ) {
    return false
  }

  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require'
  );
};

function isOwnComponent (requirePath) {
  return requirePath && requirePath.indexOf('.') === 0;
}

module.exports = requireVisitor;
