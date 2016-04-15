'use strict';

var installed = false;
var inlineSourceMap = require('jstransform/src/inline-source-map');
var coffee = undefined
var cjsx = undefined

module.exports.install = install;
module.exports.transform = transform;

function transform (filename, source, options) {
  // const jsxVisitors = require('./transforms/react-jsx-visitors').visitorList;
  // const requireVisitor = require('./transforms/custom-require-visitor');
  const topLevelVisitor = require('./transforms/top-level-render-visitor');
  const higherOrderVisitor = require('./transforms/higher-order-visitor');
  // const classVisitor = require('./transforms/react-class-visitor');
  const coffeeScriptClassVisitor = require('./transforms/coffeescript-class-visitor')
  const coffeeScriptCustomRequire = require('./transforms/coffeescript-custom-require-visitor')
  const compiledJSXVisitor = require('./transforms/compiled-jsx-visitor')
  const jstransform = require('jstransform');

  let visitors = [];
  if (options.doNotInstrument !== true) {
    visitors = visitors
      // .concat(classVisitor)
      .concat(coffeeScriptClassVisitor)
      .concat(higherOrderVisitor)
      // .concat(requireVisitor)
      .concat(coffeeScriptCustomRequire)
      .concat(topLevelVisitor)
      .concat(compiledJSXVisitor);

  }

  // visitors = visitors.concat(jsxVisitors);

  let result;
  if (options.sourceMapInline) {
    const opts = Object.assign(options, {
      sourceMap: true,
      filename: filename
    });
    result = jstransform.transform(visitors, source, opts);
    const map = inlineSourceMap(result.sourceMap, source, filename);
    result.code = result.code + '\n' + map;
  } else {
    result = jstransform.transform(visitors, source, options);
  }
  console.log(result.code);
  // debugger
  return result.code;
}

function install (options) {
  if (installed) {
    return;
  }

  options = options || {};
  if (!options.hasOwnProperty('sourceMapInline')) {
    options.sourceMapInline = true;
  }
  if (!options.hasOwnProperty('extension')) {
    options.extension = '.jsx';
  }
  if (options.extension == '.cjsx') {
    coffee = require('coffee-script');
    cjsx = require('coffee-react-transform');
  }

  require.extensions[options.extension] = function loadJsx (module, filename) {
    var content = require('fs').readFileSync(filename, 'utf8');
    if (options.extension == '.cjsx') {
      content = transformCJsx(content, filename)
    }
    var instrumented = tryInstrumenting(filename, content, options);
    tryCompiling(module, instrumented, filename);
  };
  installed = true;
}

function tryInstrumenting (filename, content, options) {
  try {
    var instrumented = transform(filename, content, options);
  } catch (e) {
    // When instrumenting nested components, we want to see only
    // the first, happening in the innermost component
    if (e.originalError) {
      throw e.originalError;
    }
    e.message = 'Error compiling ' + filename + ': ' + e.message;
    e.originalError = e;
    throw e;
  }
  return instrumented;
}

function tryCompiling (module, instrumented, filename) {
  try {
    module._compile(instrumented, filename);
  } catch (e) {
    // Chrome does not always show the stack trace
    // Better show it twice than never
    console.error(e.stack);
    throw e;
  }
}

function transformCJsx(src, filename) {
  try {
    return coffee.compile(cjsx(src), {
      'bare': true
    });
  } catch (e) {
    throw new Error('Error transforming ' + filename + ' from CJSX: ' + e.toString());
  }
  return ''
};
