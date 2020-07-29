class MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  /** @protected @const {DataProvider} */
  this.dataProvider_ = dataProvider;
}

getSource() {
  return {};
}

getType() {
  return 'circle';
}

getPaint() {
  // Simple circle paint.
  let colors = ['step', ['get', 'total']];
  // Don't use the last color here (for new cases).
  for (let i = 0; i < CaseMapDataSource.COLORS.length - 1; i++) {
    let color = CaseMapDataSource.COLORS[i];
    colors.push(color[0]);
    if (color.length > 2) {
      colors.push(color[2]);
    }
  }
  return {
    'circle-radius': [
      'case', ['<', 0, ['number', ['get', 'total']]],
      ['*', ['log10', ['sqrt', ['get', 'total']]], 5],
      0],
    'circle-color': colors,
    'circle-opacity': 0.6,
  };
}

getFeatureSet() {
  return MapDataSource.formatFeatureSet([]);
}

getLegendTitle() {
  return 'Untitled';
}

getLegendItems() {
   return [];
}
}


/**
 * Takes an array of features, and bundles them in a way that the map API
 * can ingest.
 */
MapDataSource.formatFeatureSet = function(features) {
  return {'type': 'FeatureCollection', 'features': features};
};
