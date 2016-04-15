'use strict';
var doNotWrap = {}

function addElementToGlobalMap (state, mapName, key, value) {
  var map = state.g[mapName];
  if (!map) {
    map = {};
  }
  map[key] = value;
  state.g[mapName] = map;
}

function addElementToGlobalArray (state, arrayName, element) {
  let array = state.g[arrayName];
  if (!array) {
    array = [];
  }
  array.push(element);
  state.g[arrayName] = array;
}

function addToNotWrap (componentName) {
  doNotWrap[componentName] = true
}

module.exports.doNotWrap = doNotWrap
module.exports.addToNotWrap = addToNotWrap;
module.exports.addElementToGlobalMap = addElementToGlobalMap;
module.exports.addElementToGlobalArray = addElementToGlobalArray;
