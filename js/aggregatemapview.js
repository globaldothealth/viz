class AggregateMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);

  /** @private @const */
  this.colorScale_ = AggregateMapView.initializeColorScale();
}

getId() {
  return 'aggregatemap';
}

getTitle() {
  return 'Aggregates';
}

isThreeDimensional() {
  return true;
}

getPaint() {
  let colors = ['step', ['get', 'cum_conf']];

  for (let i = 0; i < this.colorScale_.length; i++) {
    let color = this.colorScale_[i];
    // Push the color, then the value stop.
    colors.push(color[0]);
    if (i < this.colorScale_.length - 1) {
      colors.push(color[1]);
    }
  }

  return {
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-color': colors,
    'fill-extrusion-opacity': 0.8,
  };
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(50000 * feature['cum_conf']);
}

getSizeForFeature(feature) {
  // Since this map is showning country-wide features only, make them a bit
  // large.
  return 2;
}

getFeatureSet() {
  let dehydratedFeatures = this.dataProvider_.getLatestAggregateData();
  return this.formatFeatureSet(dehydratedFeatures.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getPopupContentsForFeature(f) {
  let props = f['properties'];
  const geo_id = props['geoid'];

  let totalCaseCount = 0;

  // Country, province, city
  let location = locationInfo[geo_id];
  let locationSpan = [];
  if (!!location) {
    location = location.split('|');
    // Replace country code with name if necessary
    if (location[2].length == 2) {
      location[2] = this.dataProvider_.getCountry(location[2]).getName();
    }
    const countryName = location[2];
    const country = this.dataProvider_.getCountryByName(countryName);

    // Remove empty strings
    location = location.filter(function (el) { return el != ''; });
    for (let i = 0; i < location.length; i++) {
      // if (i == location.length - 1 && !!country) {
        // TODO: Restore link to country page.
        // locationSpan.push('<a target="_blank" href="/c/' +
        // country.getCode() + '/">' + location[i] + '</a>');
      // }
      locationSpan.push(location[i]);
    }
  }
  if (!locationSpan.length) {
    return;
  }

  totalCaseCount = props['total'];

  let content = document.createElement('div');
  content.innerHTML = '<h3 class="popup-header"><span>' +
        locationSpan.join(', ') + '</span>: ' + totalCaseCount.toLocaleString() + '</h3>';
  return content;
}

formatFeature(inFeature, threeD) {
  let feature = JSON.parse(JSON.stringify(inFeature));
  const country = this.dataProvider_.getCountry(inFeature['code']);
  const centroid = country.getCentroid();
  feature['properties'] = {'geoid': centroid[1] + '|' + centroid[0]};
  feature['properties']['cum_conf'] = inFeature['cum_conf'];
  return super.formatFeature(feature, threeD);
}

getLegendTitle() {
  return 'Cases';
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
  textSideTop.textContent = '6M';
  textSideBottom.textContent = '0';
  textSideMiddle.style.flexGrow = 1;
  textSide.appendChild(textSideTop);
  textSide.appendChild(textSideMiddle);
  textSide.appendChild(textSideBottom);

  gradientLegendItem.appendChild(gradientSide);
  gradientLegendItem.appendChild(textSide);

  return [gradientLegendItem];
}

}  // AggregateMapView

AggregateMapView.initializeColorScale = function() {
  const max_cases = 6000000;
  const stops = [0, max_cases / 1.3, max_cases];
  return MapView.makeColorScale(
    hexToRgb(PerCountryMapView.COLORS[0]),
    hexToRgb(PerCountryMapView.COLORS[1]),
    hexToRgb(PerCountryMapView.COLORS[2]),
    stops);
}
