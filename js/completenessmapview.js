class CompletenessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new CompletenessMapDataSource(dataProvider), nav);
}

getId() {
  return 'completeness';
}

getTitle() {
  return 'Completeness';
}

}
