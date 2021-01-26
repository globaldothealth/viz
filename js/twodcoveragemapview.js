/** A 2D map showing coverage. */
class TwoDCoverageMapView extends PerCountryMapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'coverage';
}

getTitle() {
  return 'Coverage';
}

getPropertyNameForPaint() {
  return 'coverage';
}

getColorStops() {
  return [
    [MapView.COLORS[0], '< 20%', 20],
    [MapView.COLORS[1], '20–40%', 40],
    [MapView.COLORS[2], '40-60%', 60],
    [MapView.COLORS[3], '60–80%', 80],
    [MapView.COLORS[4], '> 80%'],
  ];
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

getPopupContentsForFeature(f) {
  const props = f['properties'];
  let contents = document.createElement('div');
  contents.innerHTML = '<h2 class="popup-title">' + props['countryname'] + ': ' +
    props['coverage'] + '%</h2> <p>(' +
    props['individualtotal'].toLocaleString() + ' out of ' +
    props['aggregatetotal'].toLocaleString() + ')</p>' + 
    '<div class="coverage-container"><div class="coverage-bar" style="height:12px;width:' + 
    props['coverage']+ '%"></div></div>' +
    '<a class="popup coverage" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + props['countryname'] +'%22">Explore Country Data</a>';
  return contents;
}

getLegendTitle() {
  return 'Coverage';
}

}
