class FreshnessMapDataSource extends MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  super(dataProvider);
}

getType() {
  return 'fill-extrusion';
}

getSizeForFeature(feature) {
  // Since this map is showning country-wide features only, make them a bit
  // large.
  return 2;
}

getFeatureSet() {
  const data = this.dataProvider_.getFreshnessData();

  let features = [];
  let codes = Object.keys(data);
  const today = new Date();
  const dayInMs = 1000 * 60 * 60 * 24;
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const dateParts = data[code].split('-');
    const date = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10));
    const age = Math.floor(Math.abs(today - date) / dayInMs);
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let feature = {
      'properties': {
        'geoid': geoId,
        'age': age,
      }
    };
    features.push(feature);
  }
  return this.formatFeatureSet(features.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getLegendTitle() {
  return 'Data freshness';
}

getLegendItems() {
  let gradientLegendItem = document.createElement('div');
  gradientLegendItem.style.display = 'flex';
  gradientLegendItem.style.height = '120px';

  let gradientSide = document.createElement('div');
  const gradientStops = CompletenessMapDataSource.COLORS.join(',');
  gradientSide.style.width = '15px';
  gradientSide.style.backgroundImage = 'linear-gradient(' + gradientStops + ')';

  let textSide = document.createElement('div');
  textSide.style.display = 'flex';
  textSide.style.flexDirection = 'column';
  textSide.style.marginLeft = '5px';
  let textSideTop = document.createElement('div');
  let textSideMiddle = document.createElement('div');
  let textSideBottom = document.createElement('div');
  textSideTop.textContent = '< 1 day';
  textSideBottom.textContent = '> 100 days';
  textSideMiddle.style.flexGrow = 1;
  textSide.appendChild(textSideTop);
  textSide.appendChild(textSideMiddle);
  textSide.appendChild(textSideBottom);

  gradientLegendItem.appendChild(gradientSide);
  gradientLegendItem.appendChild(textSide);

  return [gradientLegendItem];
}

}  // FreshnessDataSource

FreshnessMapDataSource.COLORS = [
  '#0bb300',  // green
  '#ffa900',  // orange
  '#ff0000',  // red
];
