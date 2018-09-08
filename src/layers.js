'use strict';

const {
  addAllItemsToArray,
  removeAllItemsFromArray,
  isObjectLiteral,
} = require('conjunction-junction');

const unPrefixLayers = (layers, prefixesToKeep) => {
  const pre2K = Array.isArray(prefixesToKeep) ? prefixesToKeep : [] ;
  const newLayerObj = {};
  layers.forEach(l=>{
    const lSplit = l.split('__');
    // ADJUST THIS SO IT PICKS UP ANY COMBO OF PREFIXES
    // RIGHT NOW IT IS PICKING UP A__B, BUT NOT A__X__B
    const lSlice = lSplit.filter((l,i)=>{
      return pre2K.includes(l) ||
        pre2K.includes(parseInt(l,10)) ||
        i === lSplit.length-1;
    });
    const lJoin = lSlice.join('__');
    newLayerObj[lJoin] = true;
  });
  const newLayers = [];
  for(let k in newLayerObj){
    newLayers.push(k);
  }
  newLayers.sort(); // this sorts by prefix, which is preferred in the UI
  return newLayers;
};

const groupLayersByUnit = (layersThatHaveUnits, legendObject, indexUnits) => {
  const layersGroupedByUnits = {};
  layersThatHaveUnits.forEach(key=>{
    const thisUnit =
      !Array.isArray(legendObject[key]) ?
        'units' :
        legendObject[key][indexUnits];
      
    if(!Array.isArray(layersGroupedByUnits[thisUnit])){
      if(thisUnit !== 'units'){
        layersGroupedByUnits[thisUnit] = [];
      }
    }
    if(thisUnit !== 'units'){
      layersGroupedByUnits[thisUnit].push(key);
    }
  });

  // the array is so units can be sorted in a predictable order
  const layerUnitsArray = [];
  for(let unit in layersGroupedByUnits){
    layerUnitsArray.push(unit);
    layersGroupedByUnits[unit].sort();
  }
  layerUnitsArray.sort();

  return {
    layersGroupedByUnits,
    layerUnitsArray
  };
};

const calcFirstLayerOnList = state => {
  const { layersGroupedByUnits, layerUnitsArray, layersThatHaveUnits } = state;
  const firstLayerOnList = 
    Array.isArray(layersThatHaveUnits) ?
      layersThatHaveUnits[0] :
      !Array.isArray(layerUnitsArray) ?
        '' :
        !isObjectLiteral(layersGroupedByUnits) ?
          '' :
          !Array.isArray(layersGroupedByUnits[layerUnitsArray[0]]) ?
            '' :
            layersGroupedByUnits[layerUnitsArray[0]][0];
  return firstLayerOnList;
};

const toggleLayerGroup = (state, group) => {

  let action = 
    !Array.isArray(state.layersSelected) ?
      'new' :
      'add' ;

  let index = 0;
  while(action==='add' && index < group.length){
    action = 
      state.layersSelected.includes(group[index]) ?
        'remove' : 
        'add' ;
    index ++;
  }

  const layersSelected =
    action === 'new' ?
      group :
      action === 'add' ?
        addAllItemsToArray(state.layersSelected, group) :
        action === 'remove' ?
          removeAllItemsFromArray(state.layersSelected, group) :
          state.layersSelected ;

  return layersSelected;
};

module.exports = {
  unPrefixLayers,
  groupLayersByUnit,
  calcFirstLayerOnList,
  toggleLayerGroup,
};