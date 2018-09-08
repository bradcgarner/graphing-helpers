'use strict';

var _require = require('conjunction-junction'),
    addAllItemsToArray = _require.addAllItemsToArray,
    removeAllItemsFromArray = _require.removeAllItemsFromArray,
    isObjectLiteral = _require.isObjectLiteral;

var unPrefixLayers = function unPrefixLayers(layers, prefixesToKeep) {
  var pre2K = Array.isArray(prefixesToKeep) ? prefixesToKeep : [];
  var newLayerObj = {};
  layers.forEach(function (l) {
    var lSplit = l.split('__');
    // ADJUST THIS SO IT PICKS UP ANY COMBO OF PREFIXES
    // RIGHT NOW IT IS PICKING UP A__B, BUT NOT A__X__B
    var lSlice = lSplit.filter(function (l, i) {
      return pre2K.includes(l) || pre2K.includes(parseInt(l, 10)) || i === lSplit.length - 1;
    });
    var lJoin = lSlice.join('__');
    newLayerObj[lJoin] = true;
  });
  var newLayers = [];
  for (var k in newLayerObj) {
    newLayers.push(k);
  }
  newLayers.sort(); // this sorts by prefix, which is preferred in the UI
  return newLayers;
};

var groupLayersByUnit = function groupLayersByUnit(layersThatHaveUnits, legendObject, indexUnits) {
  var layersGroupedByUnits = {};
  layersThatHaveUnits.forEach(function (key) {
    var thisUnit = !Array.isArray(legendObject[key]) ? 'units' : legendObject[key][indexUnits];

    if (!Array.isArray(layersGroupedByUnits[thisUnit])) {
      if (thisUnit !== 'units') {
        layersGroupedByUnits[thisUnit] = [];
      }
    }
    if (thisUnit !== 'units') {
      layersGroupedByUnits[thisUnit].push(key);
    }
  });

  // the array is so units can be sorted in a predictable order
  var layerUnitsArray = [];
  for (var unit in layersGroupedByUnits) {
    layerUnitsArray.push(unit);
    layersGroupedByUnits[unit].sort();
  }
  layerUnitsArray.sort();

  return {
    layersGroupedByUnits: layersGroupedByUnits,
    layerUnitsArray: layerUnitsArray
  };
};

var calcFirstLayerOnList = function calcFirstLayerOnList(state) {
  var layersGroupedByUnits = state.layersGroupedByUnits,
      layerUnitsArray = state.layerUnitsArray,
      layersThatHaveUnits = state.layersThatHaveUnits;

  var firstLayerOnList = Array.isArray(layersThatHaveUnits) ? layersThatHaveUnits[0] : !Array.isArray(layerUnitsArray) ? '' : !isObjectLiteral(layersGroupedByUnits) ? '' : !Array.isArray(layersGroupedByUnits[layerUnitsArray[0]]) ? '' : layersGroupedByUnits[layerUnitsArray[0]][0];
  return firstLayerOnList;
};

var toggleLayerGroup = function toggleLayerGroup(state, group) {

  var action = !Array.isArray(state.layersSelected) ? 'new' : 'add';

  var index = 0;
  while (action === 'add' && index < group.length) {
    action = state.layersSelected.includes(group[index]) ? 'remove' : 'add';
    index++;
  }

  var layersSelected = action === 'new' ? group : action === 'add' ? addAllItemsToArray(state.layersSelected, group) : action === 'remove' ? removeAllItemsFromArray(state.layersSelected, group) : state.layersSelected;

  return layersSelected;
};

module.exports = {
  unPrefixLayers: unPrefixLayers,
  groupLayersByUnit: groupLayersByUnit,
  calcFirstLayerOnList: calcFirstLayerOnList,
  toggleLayerGroup: toggleLayerGroup
};