class AggregateMapView extends PerCountryMapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'cumulative';
}

getTitle() {
  return 'Cumulative cases';
}

getPaint() {
  let colors = ['step', ['get', 'cum_conf']];
  const colorStops = this.getColorStops();
  for (let i = 0; i < colorStops.length; i++) {
    let color = colorStops[i];
    colors.push(color[0]);
    if (color.length > 2) {
      colors.push(color[2]);
    }
  }

  return {
    'fill-color': colors,
    'fill-outline-color': '#337abc',
    'fill-opacity': 1,
  };
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(50000 * feature['cum_conf']);
}

getSizeForFeature(feature) {
  // Since this map is showning country-wide features only, make them a bit
  // large.
  return 2;
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
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let feature = {
      'type': 'Feature',
      'properties': {
        'geoid': geoId,
        'countryname': country.getName(),
        'cum_conf': aggregateCaseCount,
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
  contents.innerHTML = '<h2><b>' + props['countryname'] + '</b></h2>' +
    '<b>' + props['cum_conf'].toLocaleString() + ' cases</b>';
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
