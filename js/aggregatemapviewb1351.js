class AggregateMapViewB1351 extends PerCountryMapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'country-b1351';
}

getTitle() {
  return 'B1351 View';
}

getPropertyNameForPaint() {
  return 'variant2';
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  const latestDateForAggregate = this.dataProvider_.getLatestDateWithAggregateData();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);
  // const aggregates = this.dataProvider_.getAggregateData()[latestDateForAggregate];
  const aggregates = [];
  let features = [];
  let codes = Object.keys(dehydratedFeatures);
  for (var key in dehydratedFeatures) {

    const code = key;
    const boundaries = this.dataProvider_.getBoundariesForCountry(code);
    if (!boundaries) {
      console.log('No available boundaries for country ' + code);
      continue;
    }
    const aggregateCaseCount = dehydratedFeatures[key]['total'];
    const voc1 = dehydratedFeatures[key]['p1'];
    const voc2 = dehydratedFeatures[key]['b1351'];
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let feature = {
      'type': 'Feature',
      'properties': {
        'geoid': geoId,
        'countryname': country.getName(),
        'cum_conf': aggregateCaseCount,
        'variant1': voc1,
        'variant2': voc2,
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
  contents.innerHTML = '<h2 class="popup-title">' + props['countryname'] + '</h2>' +
    '<p class=popup-count><strong>' + props['cum_conf'].toLocaleString() + 
    ' line list cases</strong><hr/>Variant P.1: ' + 
    props['variant1'].toLocaleString() + 
    ' <br>Variant B.1.351: ' + 
    props['variant2'].toLocaleString() + 
    '</p><a class="popup" target="_blank" href="{{LINE_LIST_URL}}/cases?country=%22' + 
    props['countryname'] +
    '%22">Explore Country Data</a>';
  return contents;
}

getLegendTitle() {
  return 'B.1.351 Cases';
}

getColorStops() {
  return [
    [MapView.GREENCOLORS[0], 'Not Reported', 1],
    [MapView.GREENCOLORS[1], '1–50', 50],
    [MapView.GREENCOLORS[2], '50–150', 150],
    [MapView.GREENCOLORS[3], '150-300', 300],
    [MapView.GREENCOLORS[4], '300-500', 500],
    [MapView.GREENCOLORS[5], '> 500']
  ];
}

}  // AggregateMapViewB1351
