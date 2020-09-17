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

}
