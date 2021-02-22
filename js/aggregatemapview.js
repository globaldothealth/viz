class AggregateMapView extends PerCountryMapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'country';
}

getTitle() {
  return 'Country View';
}

getPropertyNameForPaint() {
  return 'cum_conf';
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
    '</p><a class="popup" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + 
    props['countryname'] +
    '%22">Explore Country Data</a>';
  return contents;
}

getLegendTitle() {
  return 'Line List Cases';
}

getColorStops() {
  return [
    [MapView.COLORS[0], '< 10k', 10000],
    [MapView.COLORS[1], '10k–100k', 100000],
    [MapView.COLORS[2], '100k–500k', 500000],
    [MapView.COLORS[3], '500k–2M', 2000000],
    [MapView.COLORS[4], '2M-10M', 10000000],
    [MapView.COLORS[5], '> 10M']
  ];
}

}  // AggregateMapView
