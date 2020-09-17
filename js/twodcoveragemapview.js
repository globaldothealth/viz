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
