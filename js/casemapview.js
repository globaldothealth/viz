class CaseMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'casemap';
}

getTitle() {
  return 'Individual cases';
}

isThreeDimensional() {
  return true;
}

getPaint() {
  let colors = ['step', ['get', 'total']];
  for (let i = 0; i < CaseMapView.COLORS.length; i++) {
    let color = CaseMapView.COLORS[i];
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

getPopupContentsForFeature(f) {
  let props = f['properties'];
  const geo_id = props['geoid'];

  let totalCaseCount = 0;

  // Country, province, city
  let location = locationInfo[geo_id];
  let locationSpan = [];
  console.log(location);
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

getLegendTitle() {
  return 'Cases';
}

getLegendItems() {
  let items = [];
  for (let i = 0; i < CaseMapView.COLORS.length; i++) {
    let color = CaseMapView.COLORS[i];
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

}  // CaseMapView

/** @const */
CaseMapView.COLORS = [
  ['#c0dbf5', '< 100', 100],
  ['#a8cef1', '101–1000', 1000],
  ['#2b88dc', '1001–5000', 5000],
  ['#0271d5', '5001–20000', 20000],
  ['#0f4f88', '> 20000'],
];
