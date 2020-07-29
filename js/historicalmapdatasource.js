/** A data source for maps showing case count history. */
class HistoricalMapDataSource extends CaseMapDataSource {

getFeatureSet() {
  console.log(currentIsoDate);
  let featuresToShow = this.dataProvider_.getAtomicFeaturesForDay(currentIsoDate);
  return MapDataSource.formatFeatureSet(featuresToShow);
}
}
