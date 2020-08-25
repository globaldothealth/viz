class CompletenessMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new CompletenessMapDataSource(dataProvider), nav);
}

getType() {
  return 'fill-extrusion';
}

getId() {
  return 'completeness';
}

getTitle() {
  return '🗺  Coverage (3D)';
}

isThreeDimensional() {
  return true;
}

}
