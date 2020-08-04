/** A data source for maps showing case counts. */
class CaseMapDataSource extends MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  super(dataProvider);
}

getType() {
  return 'fill-extrusion';
}

getPaint() {
  let colors = ['step', ['get', 'total']];
  // Don't use the last color here (for new cases).
  for (let i = 0; i < CaseMapDataSource.COLORS.length - 1; i++) {
    let color = CaseMapDataSource.COLORS[i];
    colors.push(color[0]);
    if (color.length > 2) {
      colors.push(color[2]);
    }
  }
  return {
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-color': colors,
    'fill-extrusion-opacity': 0.8,
  };
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(100000 * feature['properties']['total']);
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(latestDate);
  return this.formatFeatureSet(dehydratedFeatures.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getLegendTitle() {
  return 'Cases';
}

getLegendItems() {
  let items = [];
  for (let i = 0; i < CaseMapDataSource.COLORS.length; i++) {
    let color = CaseMapDataSource.COLORS[i];
    let item = document.createElement('li');
    let circle = document.createElement('span');
    circle.className = 'circle';
    circle.style.backgroundColor = color[0];
    let label = document.createElement('span');
    label.className = 'label';
    label.textContent = color[1];
    item.appendChild(circle);
    item.appendChild(label);
    items.push(item);
  }
  return items;
}
}  // CaseMapDataSource

/** @const */
CaseMapDataSource.COLORS = [
  ['#67009e', '< 10', 10],
  ['#921694', '11–100', 100],
  ['#d34d60', '101–500', 500],
  ['#fb9533', '501–2000', 2000],
  ['#edf91c', '> 2000'],
  // ['cornflowerblue', 'New'],
];
