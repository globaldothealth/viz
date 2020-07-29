class CompletenessMapDataSource extends MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  super(dataProvider);

  /** @private @const */
  this.colorScale_ = CompletenessMapDataSource.initializeColorScale();
}

getType() {
  return 'fill-extrusion';
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
    let code = aggregate['code'];
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
  const gradientStops = CompletenessMapDataSource.COLORS.join(',');
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
}  // CompletenessMapDataSource

CompletenessMapDataSource.initializeColorScale = function() {
  // These RGB values correspond to the hex colors below. We use a mid-point
  // because blending just two colors doesn't look very nice.
  const complete = [11, 179, 0];  // green
  const mid = [255, 169, 0];  // orange
  const incomplete = [255, 0, 0];  // red

  let scale = [];
  for (let i = 0; i <= 100; i += 10) {
    // Blend two color stops, either the first two or the last two.
    let ratio = i * 2 / 100;
    let first = incomplete;
    let second = mid;
    if (i > 50) {
      ratio = (i - 50) * 2 / 100;
      first = mid;
      second = complete;
    }
    const rgb = [
      Math.floor(first[0] * (1 - ratio) + second[0] * ratio),
      Math.floor(first[1] * (1 - ratio) + second[1] * ratio),
      Math.floor(first[2] * (1 - ratio) + second[2] * ratio),
    ];
    scale.push(['rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 1)', i]);
  }
  return scale;
}

CompletenessMapDataSource.COLORS = [
  '#0bb300',  // green
  '#ffa900',  // orange
  '#ff0000',  // red
];
