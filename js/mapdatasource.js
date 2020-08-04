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

/**
 * Returns the height to display for the given feature. This is only useful for
 * a 3D map.
 */
getHeightForFeature(feature) {
  return 0;
}

/** Returns the size (in x and y) of the map artifact shown for this feature. */
getSizeForFeature(feature) {
  return 0.3;
}

getFeatureSet() {
  // This is where the features stored in our local data store need to be
  // "re-hydrated" into features ingestible by the map.
  return this.formatFeatureSet([]);
}

getLegendTitle() {
  return 'Untitled';
}

getLegendItems() {
   return [];
}

/**
 * Takes an array of features, and bundles them in a way that the map API
 * can ingest.
 */
formatFeatureSet(features) {
  return {'type': 'FeatureCollection', 'features': features};
}

/** Tweaks the given object to make it ingestable as a feature by the map API. */
formatFeature(inFeature, threeD) {
  // Make a deep copy.
  let feature = JSON.parse(JSON.stringify(inFeature));
  feature.type = 'Feature';
  if (!feature['properties']) {
    // This feature is missing key data, adding a placeholder.
    feature['properties'] = {'geoid': '0|0'};
  }
  // If the 'new' property is absent, assume 0.
  if (isNaN(feature['properties']['new'])) {
    feature['properties']['new'] = 0;
  }
  let coords = feature['properties']['geoid'].split('|');
  const featureType = threeD ? 'Polygon' : 'Point';
  const lat = parseFloat(coords[0]);
  const lng = parseFloat(coords[1]);
  // Flip latitude and longitude.
  let featureCoords = [lng, lat];
  if (threeD) {
    const half = this.getSizeForFeature(inFeature) / 2;
    featureCoords = [[
      [lng + half, lat + half],
      [lng - half, lat + half],
      [lng - half, lat - half],
      [lng + half, lat - half],
      [lng + half, lat + half],
    ]];
  }
  feature['geometry'] = {
    'type': featureType,
    'coordinates': featureCoords,
  };
  if (threeD) {
    feature['properties']['height'] = this.getHeightForFeature(inFeature);
  }
  return feature;
}

}  // MapDataSource

MapDataSource.makeColorScale = function(topColor, midColor, bottomColor, numericalScale) {
  let scale = [];
  const count = numericalScale.length - 1;
  for (let i = 0; i < numericalScale.length; i++) {
    // Blend two color stops, either the first two or the last two.
    let ratio = i * 2 / count;
    let first = bottomColor;
    let second = midColor;
    if (i > count / 2) {
      ratio = (i - count / 2) * 2 / count;
      first = midColor;
      second = topColor;
    }
    const rgb = [
      Math.floor(first[0] * (1 - ratio) + second[0] * ratio),
      Math.floor(first[1] * (1 - ratio) + second[1] * ratio),
      Math.floor(first[2] * (1 - ratio) + second[2] * ratio),
    ];
    scale.push(['rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 1)',
                numericalScale[i]]);
  }
  return scale;
}
