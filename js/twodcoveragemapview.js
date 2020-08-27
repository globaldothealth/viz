class TwoDCoverageMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new TwoDCoverageMapDataSource(dataProvider), nav);
}

fetchData() {
  let superPromise = super.fetchData();
  let self = this;
  return superPromise.then(
    // We also need country boundary data to show coverage per country.
    self.dataProvider_.fetchCountryBoundaries.bind(self.dataProvider_));
}

getId() {
  return 'coverage';
}

getTitle() {
  return '🗺  Coverage';
}

isThreeDimensional() {
  return false;
}

}
