class CompletenessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new MapDataSource(), nav);
}

getId() {
  return 'completeness';
}

getTitle() {
  return 'Completeness';
}

}
