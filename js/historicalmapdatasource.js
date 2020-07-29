/** A data source for maps showing case count history. */
class HistoricalMapDataSource extends CaseMapDataSource {

getFeatureSet() {
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(currentIsoDate);
  return MapDataSource.formatFeatureSet(dehydratedFeatures.map(
      f => MapDataSource.formatFeature(f, true /* 3D */)));
}
}
