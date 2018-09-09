'use strict';

var _require = require('conjunction-junction'),
    isPrimitiveNumber = _require.isPrimitiveNumber,
    isObjectLiteral = _require.isObjectLiteral;

var calcScreenType = function calcScreenType(w, h) {
  var phoneP_minW = 0;
  var phoneP_maxW = 500;
  var phoneP_minH = 0;
  var phoneP_maxH = 850;
  var phoneL_minW = 400;
  var phoneL_maxW = 850;
  var phoneL_minH = 300;
  var phoneL_maxH = 850;
  var tabletP_minW = 450;
  var tabletP_maxW = 1100;
  var tabletP_minH = 800;
  var tabletP_maxH = 1100;
  var tabletL_minW = 800;
  var tabletL_maxW = 1100;
  var tabletL_minH = 650;
  var tabletL_maxH = 1100;
  var desktopL_minW = 1100;
  var desktopL_minH = 800;
  var heightRanges = [];
  var widthRanges = [];

  if (h >= phoneP_minH && h <= phoneP_maxH && h >= w) heightRanges.push('phoneP');
  if (h >= phoneL_minH && h <= phoneL_maxH && w >= h) heightRanges.push('phoneL');
  if (h >= tabletL_minH && h <= tabletL_maxH && w >= h) heightRanges.push('tabletL');
  if (h >= tabletP_minH && h <= tabletP_maxH && h >= w) heightRanges.push('tabletP');
  if (h >= desktopL_minH && w >= h) heightRanges.push('desktop');

  if (w >= phoneP_minW && w <= phoneP_maxW && h >= w) widthRanges.push('phoneP');
  if (w >= phoneL_minW && w <= phoneL_maxW && w >= h) widthRanges.push('phoneL');
  if (w >= tabletL_minW && w <= tabletL_maxW && w >= h) widthRanges.push('tabletL');
  if (w >= tabletP_minW && w <= tabletP_maxW && h >= w) widthRanges.push('tabletP');
  if (w >= desktopL_minW && w >= h) widthRanges.push('desktop');

  // types are in descending order of optimization. I.e. desktop is most optimized, so use it if we can.
  var types = ['phoneP', 'phoneL', 'tabletP', 'tabletL', 'desktop'];
  var type = 'phoneP'; // default
  types.forEach(function (t) {
    if (heightRanges.includes(t) && widthRanges.includes(t)) {
      type = t;
    }
  });
  return {
    type: type,
    testKeys: {
      heightRanges: heightRanges,
      widthRanges: widthRanges
    }
  };
};

var calcCanvasDimensions = function calcCanvasDimensions(input) {
  var win = input.win,
      state = input.state,
      reduceCanvasHeightBy = input.reduceCanvasHeightBy;
  // win is window; make sure it is passed in

  if (!win) return { canvasWidth: 0, canvasHeight: 0 };
  if (!win.innerWidth || !win.innerHeight) {
    return { canvasWidth: 0, canvasHeight: 0 };
  }
  var controlsCss = {
    onLeftIfWidthOver: 520,
    heightAtTop: 40,
    widthAtLeft: 30,
    marginTop: state.cssGraphMarginTop
  };
  var wRaw = win.innerWidth;
  var hRaw = win.innerHeight;
  var wAvailable = wRaw - (wRaw >= controlsCss.onLeftIfWidthOver ? controlsCss.widthAtLeft : 0);
  var hAvailable = hRaw - (wRaw >= controlsCss.onLeftIfWidthOver ? 0 : controlsCss.heightAtTop) - controlsCss.marginTop;
  var screenType = calcScreenType(wRaw, hRaw).type;
  var idealRatio = 1.618; // golden mean!
  var canvasWidth = Math.floor(0.97 * wAvailable);
  var canvasHeightRaw = screenType === 'phoneP' ? hRaw : screenType === 'phoneL' ? Math.floor(canvasWidth / idealRatio) : screenType === 'tabletL' ? hAvailable : screenType === 'tabletP' ? wRaw : hAvailable;
  // const hAdj = hIdeal <= hAvailable ? hIdeal : Math.floor(hAvailable) ;
  // through this point, we calculate a rectangle for the graph
  // hExtraForLegend increases vertical height to adjust for legend
  // otherwise, legend eats into graph space

  // const legendDeviceHeight =
  //   hAvailable < 500       ? 180 : // correct for landscape phones
  //     screenType === 'Pnarrow' ? 150 :
  //       screenType === 'Pwide'   ? 100 :
  //         screenType === 'Square'  ?  50 :
  //           screenType === 'Ltall'   ?   0 :
  //             0 ;              
  var canvasHeight = canvasHeightRaw - reduceCanvasHeightBy; // + legendDeviceHeight;
  return {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    testKeys: {
      screenType: screenType,
      canvasHeightRaw: canvasHeightRaw,
      wAvailable: wAvailable,
      hAvailable: hAvailable
    }
  };
};

var calcDimensions = function calcDimensions(state) {
  // this runs on mount, on window resize, and when opening and closing selectors
  var reduceCanvasHeightBy = state.controlInFocus === 'preSets' ? Math.min(0.3 * window.innerHeight, 400) : 0;

  var _calcCanvasDimensions = calcCanvasDimensions({
    win: window,
    marginVertical: state.cssMarginTop,
    marginHorizontal: state.cssMarginHorizontal,
    reduceCanvasHeightBy: reduceCanvasHeightBy
  }),
      canvasHeight = _calcCanvasDimensions.canvasHeight,
      canvasWidth = _calcCanvasDimensions.canvasWidth;

  var cssControlHeight = window.innerWidth > state.cssLayerSelectorMediaBreak ? canvasHeight : 25;
  var selectorsHeight = state.controlInFocus === 'preSets' ? state.cssPreSetSelectorsHeight : state.controlInFocus === 'layers' ? state.cssLayerSelectorsHeight : 0;
  if (canvasWidth < state.cssSelectorsFullWidth && state.controlInFocus === 'layers') {
    var widthPerCol = Math.ceil(state.cssSelectorsFullWidth / state.cssLayerSelectorsFullColumns);
    var cols = Math.floor(canvasWidth / widthPerCol);
    var ratio = state.cssLayerSelectorsFullColumns / cols;
    selectorsHeight = selectorsHeight * ratio;
  }
  var cssSelectorOuterScrollingContainer = {
    height: selectorsHeight,
    overflowY: 'scroll',
    width: '90vw'
  };
  var cssGraphStabilizer = { // same dimensions as graph, so hide/show graph doesn't blink
    height: canvasHeight,
    width: canvasWidth
  };
  var totalHeight = canvasHeight + state.cssMarginTop + selectorsHeight;

  var cssGraphFlexInner = {
    minHeight: totalHeight,
    display: 'block',
    maxWidth: '100vw',
    maxHeight: '100vh'
  };
  var cssGraphFlexOuter = { // outermost div for the entire component
    zIndex: 999,
    marginTop: state.cssGraphMarginTop,
    minHeight: totalHeight
  };
  return {
    cssCanvasHeight: canvasHeight,
    cssCanvasWidth: canvasWidth,
    cssControlHeight: cssControlHeight,
    cssGraphFlexOuter: cssGraphFlexOuter,
    cssGraphFlexInner: cssGraphFlexInner,
    cssSelectorOuterScrollingContainer: cssSelectorOuterScrollingContainer,
    cssGraphStabilizer: cssGraphStabilizer
  };
};

module.exports = {
  calcScreenType: calcScreenType,
  calcCanvasDimensions: calcCanvasDimensions,
  calcDimensions: calcDimensions
};