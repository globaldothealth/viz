/** A data source for 2D maps showing coverage. */
class TwoDCoverageMapDataSource extends MapDataSource {

/** @param {DataProvider} dataProvider */
constructor(dataProvider) {
  super(dataProvider);

  /** @private @const */
  this.colorScale_ = TwoDCoverageMapDataSource.initializeColorScale();
}

getType() {
  return 'fill';
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
    const boundaries = this.dataProvider_.getBoundariesForCountry(code);
    if (!boundaries) {
      console.log('No available boundaries for country ' + code);
      continue;
    }
    const aggregateCaseCount = aggregate['cum_conf'];
    let individualCaseCount = 0;
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    if (!!dehydratedFeatures[code]) {
      individualCaseCount = dehydratedFeatures[code]['total'];
    }
    let percent = Math.floor(
        Math.min(100, (individualCaseCount / aggregateCaseCount) * 100));
    let feature = {
      'type': 'Feature',
      'properties': {
        'geoid': geoId,
        'countryname': country.getName(),
        'individualtotal': individualCaseCount,
        'aggregatetotal': aggregateCaseCount,
        'coverage': percent,
      },
      'geometry': boundaries,
    };
    features.push(feature);
  }
  return this.formatFeatureSet(features.map(
      f => this.formatFeature(f, false /* 3D */)));
}

getPaint() {
  let colors = ['step', ['get', 'coverage']];
  for (let i = 0; i < this.colorScale_.length; i++) {
    let color = this.colorScale_[i];
    // Push the color, then the value stop.
    colors.push(color[0]);
    if (i < this.colorScale_.length - 1) {
      colors.push(color[1]);
    }
  }
  return {
    'fill-color': colors,
    'fill-outline-color': '#337abc',
    'fill-opacity': 1,
  };
}

formatFeature(inFeature, threeD) {
  // No need to format much here.
  return inFeature;
}

getPopupContentsForFeature(f) {
  const props = f['properties'];
  let contents = document.createElement('div');
  contents.innerHTML = '<h2><b>' + props['countryname'] + '</b></h2>' +
    '<b>' + props['coverage'] + ' %</b> (' +
    props['individualtotal'].toLocaleString() + ' out of ' +
    props['aggregatetotal'].toLocaleString() + ')';
  return contents;
}

getLegendTitle() {
  return 'Coverage';
}

getLegendItems() {
  let gradientLegendItem = document.createElement('div');
  gradientLegendItem.style.display = 'flex';
  gradientLegendItem.style.height = '120px';

  let gradientSide = document.createElement('div');
  const gradientStops = TwoDCoverageMapDataSource.COLORS.join(',');
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

}

TwoDCoverageMapDataSource.initializeColorScale = function() {
  // These RGB values correspond to the hex colors below. We use a mid-point
  // because blending just two colors doesn't look very nice.
  const complete = [67, 146, 221];  // vibrant blue
  const mid = [146, 195, 238];  // light blue
  const incomplete = [232, 239, 247];  // nearly white
  const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return MapDataSource.makeColorScale(complete, mid, incomplete, stops);
}

TwoDCoverageMapDataSource.COLORS = [
  '#4392dd',  // vibrant blue
  '#92c3ee',  // light blue
  '#e8eff7',  // nearly white
];
