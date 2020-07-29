class MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  /** @protected @const {DataProvider} */
  this.dataProvider_ = dataProvider;
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
