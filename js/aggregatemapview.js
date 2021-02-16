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
  var pageURL = window.location.href;
  var lastURLSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);
  console.log(lastURLSegment);
  if (lastURLSegment == "variant1") {
    return 'variant1';
  }
  if (lastURLSegment == "variant2") {
    return 'variant2';
  }
  if (lastURLSegment == "variant3") {
    return 'variant3';
  }

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
    const voc1 = dehydratedFeatures[key]['variant1'];
    const voc2 = dehydratedFeatures[key]['variant2'];
    const voc3 = dehydratedFeatures[key]['variant3'];
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
        'variant3': voc3,
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
    ' total cases</strong><hr/>Variant 1: ' + 
    props['variant1'].toLocaleString() + 
    ' <br>Variant 2: ' + 
    props['variant2'].toLocaleString() + 
    ' <br>Variant 3: ' + 
    props['variant3'].toLocaleString() + 
    '</p><a class="popup" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + 
    props['countryname'] +
    '%22">Explore Country Data</a>';
  return contents;
}

getLegendTitle() {
  return 'Cases';
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
