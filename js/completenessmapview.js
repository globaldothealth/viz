class CompletenessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);

  /** @private @const */
  this.colorScale_ = CompletenessMapView.initializeColorScale();
}

getType() {
  return 'fill-extrusion';
}

getId() {
  return 'completeness';
}

getTitle() {
  return '🗺  Coverage (3D)';
}

isThreeDimensional() {
  return true;
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(100000 * feature['properties']['aggregatetotal']);
}

getSizeForFeature(feature) {
  // Since this map is showning country-wide features only, make them a bit
  // large.
  return 2;
}

getPaint() {
  let colors = ['step', ['get', 'completeness']];
  for (let i = 0; i < this.colorScale_.length; i++) {
    let color = this.colorScale_[i];
    // Push the color, then the value stop.
    colors.push(color[0]);
    if (i < this.colorScale_.length - 1) {
      colors.push(color[1]);
    }
  }
  return {
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-color': colors,
    'fill-extrusion-opacity': 0.8,
  };
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  const latestDateForAggregate = this.dataProvider_.getLatestDateWithAggregateData();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);
  const aggregates = this.dataProvider_.getAggregateData()[latestDateForAggregate];
  let features = [];
  let codes = Object.keys(dehydratedFeatures);
  for (let i = 0; i < aggregates.length; i++) {
    let aggregate = aggregates[i];
    const code = aggregate['code'];
    const aggregateCaseCount = aggregate['cum_conf'];
    let individualCaseCount = 0;
    if (!!dehydratedFeatures[code]) {
      individualCaseCount = dehydratedFeatures[code]['total'];
    }
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let percent = Math.floor(
        Math.min(100, (individualCaseCount / aggregateCaseCount) * 100));
    let feature = {
      'properties': {
        'geoid': geoId,
        'individualtotal': individualCaseCount,
        'aggregatetotal': aggregateCaseCount,
        'completeness': percent
      }
    };
    features.push(feature);
  }
  return this.formatFeatureSet(features.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getLegendTitle() {
  return 'Completeness';
}

getLegendItems() {
  let gradientLegendItem = document.createElement('div');
  gradientLegendItem.style.display = 'flex';
  gradientLegendItem.style.height = '120px';

  let gradientSide = document.createElement('div');
  const gradientStops = CompletenessMapView.COLORS.join(',');
  gradientSide.style.width = '15px';
  gradientSide.style.backgroundImage = 'linear-gradient(' + gradientStops + ')';

  let textSide = document.createElement('div');
  textSide.style.display = 'flex';
  textSide.style.flexDirection = 'column';
  textSide.style.marginLeft = '5px';
  let textSideTop = document.createElement('div');
  let textSideMiddle = document.createElement('div');
  let textSideBottom = document.createElement('div');
  textSideTop.textContent = '100%';
  textSideBottom.textContent = '0%';
  textSideMiddle.style.flexGrow = 1;
  textSide.appendChild(textSideTop);
  textSide.appendChild(textSideMiddle);
  textSide.appendChild(textSideBottom);

  gradientLegendItem.appendChild(gradientSide);
  gradientLegendItem.appendChild(textSide);

  return [gradientLegendItem];
}
}  // CompletenessMapView

CompletenessMapView.initializeColorScale = function() {
  const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return MapView.makeColorScale(
    hexToRgb(CompletenessMapView.COLORS[0]),
    hexToRgb(CompletenessMapView.COLORS[1]),
    hexToRgb(CompletenessMapView.COLORS[2]),
    stops);
}

// We use a mid-point because blending just two colors doesn't look very nice.
CompletenessMapView.COLORS = [
  '#0bb300',  // green
  '#ffa900',  // orange
  '#ff0000',  // red
];
