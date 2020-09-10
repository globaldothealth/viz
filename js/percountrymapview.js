/**
 * A simple, two-dimensional per-country map view
 * @abstract
 */
class PerCountryMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);

  /** @private @const */
  this.colorScale_ = TwoDCoverageMapView.initializeColorScale();
}

fetchData() {
  let superPromise = super.fetchData();
  let self = this;
  return superPromise.then(
    // We also need country boundary data to show data per country.
    self.dataProvider_.fetchCountryBoundaries.bind(self.dataProvider_));
}

isThreeDimensional() {
  return false;
}

getType() {
  return 'fill';
}

getPaint() {
  let colors = ['step', ['get', 'coverage']];
  for (let i = 0; i < this.colorScale_.length; i++) {
    let color = this.colorScale_[i];
    // Push the color, then the value stop.
    colors.push(color[0]);
    if (i < this.colorScale_.length - 1) {
      colors.push(color[1]);
    }
  }
  return {
    'fill-color': colors,
    'fill-outline-color': '#337abc',
    'fill-opacity': 1,
  };
}

formatFeature(inFeature, threeD) {
  // No need to format much here.
  return inFeature;
}

getLegendItems() {
  let gradientLegendItem = document.createElement('div');
  gradientLegendItem.style.display = 'flex';
  gradientLegendItem.style.height = '120px';

  let gradientSide = document.createElement('div');
  const gradientStops = PerCountryMapView.COLORS.join(',');
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

}  // PerCountryMapView

PerCountryMapView.initializeColorScale = function() {
  const stops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return MapView.makeColorScale(
    hexToRgb(PerCountryMapView.COLORS[0]),
    hexToRgb(PerCountryMapView.COLORS[1]),
    hexToRgb(PerCountryMapView.COLORS[2]),
    stops);
}

PerCountryMapView.COLORS = [
  '#0093df',  // vibrant blue
  '#6bbde9',  // light blue
  '#e4eef3',  // nearly white
];