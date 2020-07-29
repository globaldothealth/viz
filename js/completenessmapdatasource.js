class CompletenessMapDataSource extends MapDataSource {

/**
 * @param {DataProvider} dataProvider
 */
constructor(dataProvider) {
  super(dataProvider);
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);
  let features = [];
  let codes = Object.keys(dehydratedFeatures);
  for (let i = 0; i < codes.length; i++) {
    let code = codes[i];
    const country = this.dataProvider_.getCountry(code);
    const centroid = country.getCentroid();
    const geoId = [centroid[1], centroid[0]].join('|');
    let feature = {
      'properties': {
      'geoid': geoId, 'total': dehydratedFeatures[code]['total']
      }
    };
    features.push(feature);
  }
  return MapDataSource.formatFeatureSet(features.map(
      f => MapDataSource.formatFeature(f, true /* 3D */)));
}

getLegendTitle() {
  return 'Completeness';
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
  textSideTop.textContent = '100%';
  textSideBottom.textContent = '0%';
  textSideMiddle.style.flexGrow = 1;
  textSide.appendChild(textSideTop);
  textSide.appendChild(textSideMiddle);
  textSide.appendChild(textSideBottom);

  gradientLegendItem.appendChild(gradientSide);
  gradientLegendItem.appendChild(textSide);

  return [gradientLegendItem];
}
}  // CompletenessMapDataSource

CompletenessMapDataSource.COLORS = [
  '#0bb300',  // green
  '#ffa900',  // orange
  '#ff0000',  // red
];
