class FreshnessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);

  /** @private @const */
  this.colorScale_ = FreshnessMapView.initializeColorScale();
}

getType() {
  return 'fill-extrusion';
}

getId() {
  return 'freshness';
}

getTitle() {
  return '🗺  Freshness';
}

isThreeDimensional() {
  return true;
}

fetchData() {
  const dp = this.dataProvider_;
  return super.fetchData().then(dp.fetchFreshnessData.bind(dp));
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(100000 * feature['properties']['individualtotal']);
}

getSizeForFeature(feature) {
  // Since this map is showning country-wide features only, make them a bit
  // large.
  return 2;
}

getPaint() {
  let colors = ['step', ['get', 'age']];
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
  const data = this.dataProvider_.getFreshnessData();

  let features = [];
  let codes = Object.keys(data);
  const latestDate = this.dataProvider_.getLatestDate();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);

  const today = new Date();
  const dayInMs = 1000 * 60 * 60 * 24;
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const dateParts = data[code].split('-');
    const date = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10));
    let individualCaseCount = 0;
    if (!!dehydratedFeatures[code]) {
      individualCaseCount = dehydratedFeatures[code]['total'];
    }
    const age = Math.floor(Math.abs(today - date) / dayInMs);
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let feature = {
      'properties': {
        'geoid': geoId,
        'age': age,
        'individualtotal': individualCaseCount,
      }
    };
    features.push(feature);
  }
  return this.formatFeatureSet(features.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getLegendTitle() {
  return 'Data freshness';
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
  textSideTop.textContent = '< 1 day';
  textSideBottom.textContent = '> 100 days';
  textSideMiddle.style.flexGrow = 1;
  textSide.appendChild(textSideTop);
  textSide.appendChild(textSideMiddle);
  textSide.appendChild(textSideBottom);

  gradientLegendItem.appendChild(gradientSide);
  gradientLegendItem.appendChild(textSide);

  return [gradientLegendItem];
}

}  // FreshnessMapView

FreshnessMapView.initializeColorScale = function() {
  const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return MapView.makeColorScale(
    hexToRgb(FreshnessMapView.COLORS[0]),
    hexToRgb(FreshnessMapView.COLORS[1]),
    hexToRgb(FreshnessMapView.COLORS[2]),
    stops);
}

// We use a mid-point because blending just two colors doesn't look very nice.
FreshnessMapView.COLORS = [
  '#0bb300',  // green
  '#ffa900',  // orange
  '#ff0000',  // red
];
