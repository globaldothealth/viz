/** A data source for maps showing case count history. */
class HistoricalMapDataSource extends CaseMapDataSource {

getFeatureSet() {
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(currentIsoDate);
  return this.formatFeatureSet(dehydratedFeatures.map(
      f => this.formatFeature(f, true /* 3D */)));
}
}
