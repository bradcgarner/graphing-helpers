'use strict';

var _require = require('conjunction-junction'),
    isObjectLiteral = _require.isObjectLiteral;

var _require2 = require('./palettes'),
    listBright = _require2.listBright,
    createMonoChrome = _require2.createMonoChrome;

var formatSelectors = function formatSelectors(thisPreSet, groupTrue, groupsRaw) {
  var groups = Array.isArray(groupsRaw) ? groupsRaw : [];
  var selectors = [''];
  if (Array.isArray(thisPreSet.layersSelected)) {
    if (thisPreSet.layersSelected.length > 0) {
      if (thisPreSet.type === 'group') {
        if (groupTrue) {
          selectors = [];
          thisPreSet.layersSelected.forEach(function (layer) {
            groups.forEach(function (group) {
              selectors.push(group + '__' + layer);
            });
          });
        } else {
          selectors = thisPreSet.layersSelected;
        }
      } else {
        selectors = thisPreSet.layersSelected;
      }
    }
  }
  var selectorsRemaining = selectors.length <= 1 ? [] : selectors.slice(1, selectors.length);

  return { selectors: selectors, selectorsRemaining: selectorsRemaining };
};

var formatAllStyles = function formatAllStyles(input) {
  var thisPreSet = input.thisPreSet,
      styles = input.styles,
      groups = input.groups,
      groupsSub = input.groupsSub,
      newGroupColors = input.newGroupColors,
      preSetGlobalPalettes = input.preSetGlobalPalettes,
      layersAllPrefixed = input.layersAllPrefixed,
      layersAllUnPrefixed = input.layersAllUnPrefixed;

  console.log('layersAllUnPrefixed', layersAllUnPrefixed);
  console.log('layersAllUnPrefixed', layersAllUnPrefixed);

  var theseStyles = {};

  layersAllPrefixed.forEach(function (layer) {
    var unPrefixedArr = layer.split('__');
    var unPrefix = unPrefixedArr[unPrefixedArr.length - 1];
    var group = void 0,
        groupSub = void 0;
    groups.forEach(function (g) {
      if (layer.includes(g + '__')) {
        group = g;
      }
    });
    groupsSub.forEach(function (s) {
      if (layer.includes(s + '__')) {
        groupSub = s;
      }
    });
    var g = group ? group : '';
    var g_ = g ? g + '__' : '';
    var s = groupSub ? groupSub : '';
    var s_ = s ? s + '__' : '';
    // find the closest style match
    var thisStyle = isObjectLiteral(thisPreSet.styles[layer]) ? Object.assign({}, thisPreSet.styles[layer]) : isObjectLiteral(thisPreSet.styles[unPrefix]) ? Object.assign({}, thisPreSet.styles[unPrefix]) : isObjectLiteral(thisPreSet.styles['' + g_ + s_ + layer]) ? Object.assign({}, thisPreSet.styles['' + g_ + s_ + layer]) : isObjectLiteral(thisPreSet.styles['' + g_ + layer]) ? Object.assign({}, thisPreSet.styles['' + g_ + layer]) : isObjectLiteral(thisPreSet.styles['' + s_ + layer]) ? Object.assign({}, thisPreSet.styles['' + s_ + layer]) : isObjectLiteral(styles[layer]) ? Object.assign({}, styles[layer]) : isObjectLiteral(styles[unPrefix]) ? Object.assign({}, styles[unPrefix]) : { style: {} };

    var shade = !isObjectLiteral(thisStyle.style) ? 0 : thisStyle.style.shade > 0 ? thisStyle.style.shade : 0;

    var color = thisStyle.color;
    var groupColor = newGroupColors[group];
    if (groupColor) {
      if (preSetGlobalPalettes[groupColor]) {
        if (shade >= 0 && preSetGlobalPalettes[groupColor][shade - 1]) {
          color = preSetGlobalPalettes[groupColor][shade - 1];
        }
      }
    }
    thisStyle.color = color ? color : '80, 80, 80';
    theseStyles[layer] = thisStyle;
  });

  return theseStyles;
};

var assignPreSetGroupColors = function assignPreSetGroupColors(input) {
  var groups = input.groups,
      groupColors = input.groupColors,
      preSetGlobalPalettes = input.preSetGlobalPalettes,
      preSetGlobalColorOptions = input.preSetGlobalColorOptions;


  var defaultReturn = {
    colorsUsed: {},
    newGroupColors: {},
    groupDotColors: {}
  };
  if (!Array.isArray(groups)) return defaultReturn;

  var colorsUsed = {};
  var newGroupColors = {};
  var groupDotColors = {};

  groups.forEach(function (group) {
    // THIS DOES NOT SEEM TO resolve duplicates
    // if we did supply a group color
    if (groupColors[group]) {
      // if group color not already used
      if (!colorsUsed[groupColors[group]]) {
        newGroupColors[group] = groupColors[group];
        groupDotColors[group] = preSetGlobalPalettes[newGroupColors[group]][0];
        // else if group color is used
      } else {
        preSetGlobalColorOptions.forEach(function (color) {
          if (!newGroupColors[group]) {
            if (!colorsUsed[color]) {
              colorsUsed[color] = true;
              newGroupColors[group] = color;
              groupDotColors[group] = preSetGlobalPalettes[newGroupColors[group]][0];
            }
          }
        });
      }
      // we did not supply a group color
    } else {
      preSetGlobalColorOptions.forEach(function (color) {
        if (!newGroupColors[group]) {
          if (!colorsUsed[color]) {
            colorsUsed[color] = true;
            newGroupColors[group] = color;
            groupDotColors[group] = preSetGlobalPalettes[newGroupColors[group]][0];
          }
        }
      });
    }
  });
  return {
    colorsUsed: colorsUsed,
    newGroupColors: newGroupColors,
    groupDotColors: groupDotColors
  };
};

var formatGroupsStyles = function formatGroupsStyles(input) {
  var thisPreSet = input.thisPreSet,
      groupTrue = input.groupTrue,
      groups = input.groups,
      groupsSub = input.groupsSub,
      groupColors = input.groupColors,
      preSetGlobalColorOptions = input.preSetGlobalColorOptions,
      preSetGlobalPalettes = input.preSetGlobalPalettes,
      layersAllPrefixed = input.layersAllPrefixed,
      layersAllUnPrefixed = input.layersAllUnPrefixed,
      styles = input.styles;


  var defaultObject = {
    stylesAppended: styles,
    colorsUsed: {},
    newGroupColors: {},
    groupDotColors: {}
  };

  if (!isObjectLiteral(thisPreSet.styles)) {
    // i.e. no material to read from
    return Object.assign({}, defaultObject, { styles: {} });
  } else if ((!groupTrue || !Array.isArray(groups)) && thisPreSet.graph === 'test_measurements') {
    // FIX ABOVE ^^^^^^^^^ DO NOT HARD CODE GRAPH TYPE !!!!!!
    return defaultObject;
  }

  var _assignPreSetGroupCol = assignPreSetGroupColors({
    groups: groups,
    groupColors: groupColors,
    preSetGlobalPalettes: preSetGlobalPalettes,
    preSetGlobalColorOptions: preSetGlobalColorOptions
  }),
      newGroupColors = _assignPreSetGroupCol.newGroupColors,
      groupDotColors = _assignPreSetGroupCol.groupDotColors;

  var stylesAppended = formatAllStyles({
    thisPreSet: thisPreSet,
    styles: styles,
    groups: groups,
    groupsSub: groupsSub,
    newGroupColors: newGroupColors,
    preSetGlobalPalettes: preSetGlobalPalettes,
    layersAllPrefixed: layersAllPrefixed,
    layersAllUnPrefixed: layersAllUnPrefixed
  });

  return {
    stylesAppended: stylesAppended,
    newGroupColors: newGroupColors,
    groupDotColors: groupDotColors
  };
};

var formatPreSetToLoad = function formatPreSetToLoad(state, thisPreSet, id) {
  // this is adding extra prefixes
  // edit this to add ALL possible styles, hydrating from defaults
  // AND NO extra styles from extra prefix combinations
  var groupTrue = state.groupTrue,
      groups = state.groups,
      groupsSub = state.groupsSub,
      groupColors = state.groupColors,
      styles = state.styles,
      preSetGlobalPalettes = state.preSetGlobalPalettes,
      preSetGlobalColorOptions = state.preSetGlobalColorOptions,
      layersAllUnPrefixed = state.layersAllUnPrefixed,
      layersAllPrefixed = state.layersAllPrefixed;

  console.log('styles in formatPreSetToLoad', styles);

  var _formatSelectors = formatSelectors(thisPreSet, groupTrue, groups),
      selectorsRemaining = _formatSelectors.selectorsRemaining,
      selectors = _formatSelectors.selectors;

  var _formatGroupsStyles = formatGroupsStyles({
    thisPreSet: thisPreSet,
    groupTrue: groupTrue,
    groups: groups,
    groupsSub: Array.isArray(groupsSub) ? groupsSub : [''],
    groupColors: groupColors,
    preSetGlobalColorOptions: preSetGlobalColorOptions,
    preSetGlobalPalettes: preSetGlobalPalettes,
    styles: styles,
    layersAllPrefixed: layersAllPrefixed,
    layersAllUnPrefixed: layersAllUnPrefixed
  }),
      stylesAppended = _formatGroupsStyles.stylesAppended,
      newGroupColors = _formatGroupsStyles.newGroupColors,
      groupDotColors = _formatGroupsStyles.groupDotColors;

  console.log('stylesAppended in formatPreSetToLoad', stylesAppended);

  var _formatIcons = formatIcons(thisPreSet),
      preSetIconNew = _formatIcons.preSetIconNew,
      preSetNameNew = _formatIcons.preSetNameNew;

  return {
    groupColors: newGroupColors,
    groupDotColors: groupDotColors,
    preSetIdActive: id,
    layersSelected: selectorsRemaining,
    selector0: selectors[0],
    styles: stylesAppended,
    preSetIconNew: preSetIconNew, // pre-load for editing
    preSetNameNew: preSetNameNew, // pre-load for editing
    preSetIdPrior: id // this is intended to work like "last selected"
  };
};

var formatIcons = function formatIcons(thisPreSet) {
  var icon = !thisPreSet.icon ? null : thisPreSet.icon;
  var name = !thisPreSet.name ? null : thisPreSet.name;
  return {
    preSetIconNew: icon,
    preSetNameNew: name
  };
};

var formatPreSetColumns = function formatPreSetColumns(cssStyleColorsNamed) {
  // this is only the names of the colors to use for selectors
  var cssStyleColorsNamedArray = [];
  for (var key in cssStyleColorsNamed) {
    cssStyleColorsNamedArray.push(key);
  }
  cssStyleColorsNamedArray.sort();
  var preSetColumns = [{
    key: 'color',
    label: 'color',
    type: 'color',
    optionLabels: cssStyleColorsNamedArray,
    optionValues: cssStyleColorsNamedArray,
    defaultValue: 'red'
  }, {
    key: 'fill',
    label: 'fill',
    type: 'boolean',
    optionLabels: ['true', 'false'],
    optionValues: ['true', 'false'],
    defaultValue: 'true'
  }, {
    key: 'opacityBackground',
    label: 'fill opacity',
    type: 'number',
    step: 0.1,
    min: 0,
    max: 1,
    defaultValue: 0.1
  }, {
    key: 'opacityBorder',
    label: 'line opacity',
    type: 'number',
    step: 0.1,
    min: 0,
    max: 1,
    defaultValue: 1
  }, {
    key: 'borderWidth',
    label: 'line weight',
    type: 'number',
    step: 0.1,
    min: 1,
    max: 10,
    defaultValue: 1
  }, {
    key: 'borderDash',
    label: 'line type',
    type: 'array',
    optionLabels: ['solid', 'medium dashes', 'long dashes and gaps', 'medium dashes, short gaps', 'short dashes, long gaps', 'long dashes, short gaps'],
    optionValues: ['', '10,10', '20,20', '10,5', '5,20', '20, 5'],
    defaultValue: ''
  }, {
    key: 'pointBorderWidth',
    label: 'point size',
    type: 'number',
    step: 0.1,
    min: 1,
    max: 10,
    defaultValue: 1
  }, {
    key: 'opacityPoint',
    label: 'point opacity',
    type: 'number',
    step: 0.1,
    min: 0,
    max: 1,
    defaultValue: 1
  }];
  return {
    preSetColumns: preSetColumns,
    cssStyleColorsNamedArray: cssStyleColorsNamedArray
  };
};

var createPreSetGlobalPalettes = function createPreSetGlobalPalettes() {
  var colors = listBright();
  var preSetGlobalPalettes = {};
  colors.forEach(function (color) {
    preSetGlobalPalettes[color] = createMonoChrome(color);
  });
  return preSetGlobalPalettes;
};

var selectDefaultPreSet = function selectDefaultPreSet(state) {
  var preSets = state.preSets,
      graphName = state.graphName;

  var preSetIdActive = void 0;
  for (var id in preSets) {
    if (preSets[id].graph === graphName && preSets[id].def) {
      preSetIdActive = id;
    }
  }
  // worst case, no default and id list didn't load yet
  if (preSetIdActive) return preSetIdActive;

  for (var _id in preSets) {
    if (preSets[_id].graph === graphName) {
      preSetIdActive = _id;
    }
  }

  return preSetIdActive;
};

module.exports = {
  formatSelectors: formatSelectors,
  formatAllStyles: formatAllStyles,
  assignPreSetGroupColors: assignPreSetGroupColors,
  formatGroupsStyles: formatGroupsStyles,
  formatPreSetToLoad: formatPreSetToLoad,
  formatIcons: formatIcons,
  formatPreSetColumns: formatPreSetColumns,
  createPreSetGlobalPalettes: createPreSetGlobalPalettes,
  selectDefaultPreSet: selectDefaultPreSet
};