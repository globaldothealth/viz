/** A data source for maps showing case count history. */
class HistoricalMapDataSource extends CaseMapDataSource {

getFeatureSet() {
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(currentIsoDate);
  return this.formatFeatureSet(dehydratedFeatures.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getPopupContentsForFeature(f) {
  const container = document.createElement('div');
  const parent = super.getPopupContentsForFeature(f);
  container.appendChild(parent);

  const geo_id = f['properties']['geoid'];
  let relevantFeaturesByDay = {};
  const dates = this.dataProvider_.getDates();
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    relevantFeaturesByDay[date] = [];
    const atomicFeatures = this.dataProvider_.getAtomicFeaturesForDay(date);
    if (!atomicFeatures) {
      continue;
    }
    for (let j = 0; j < atomicFeatures.length; j++) {
      const feature = atomicFeatures[j];
      if (!feature) {
        continue;
      }
      if (feature['properties']['geoid'] == geo_id) {
        relevantFeaturesByDay[date].push(feature);
      }
    }
  }

  let graphContainer = document.createElement('div');
  graphContainer.classList.add('chart');
  Graphing.makeCasesGraph(
      DataProvider.convertGeoJsonFeaturesToGraphData(
          relevantFeaturesByDay, 'total'), false /* average */,
          graphContainer);
  container.appendChild(graphContainer);

  return container;
}

}
