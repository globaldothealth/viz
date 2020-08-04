class FreshnessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new FreshnessMapDataSource(dataProvider), nav);
}

getType() {
  return 'fill-extrusion';
}

getId() {
  return 'freshness';
}

getTitle() {
  return 'Freshness Map';
}

fetchData() {
  const dp = this.dataProvider_;
  return super.fetchData().then(dp.fetchFreshnessData.bind(dp));
}

}
