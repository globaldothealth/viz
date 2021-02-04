class CaseMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'cases';
}

getTitle() {
  return 'Regional View';
}

isThreeDimensional() {
  return true;
}

getPropertyNameForPaint() {
  return 'total';
}

getHeightForFeature(feature) {
  return 10 * Math.sqrt(100000 * feature['properties']['total']);
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(latestDate);
  console.log("how far nah: ", dehydratedFeatures);
  // return this.formatFeatureSet(dehydratedFeatures.map(
  //     f => this.formatFeature(f, true /* 3D */)));
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
    let countryName = location.slice(-1)[0];
    // Replace country code with name if necessary
    if (countryName.length == 2) {
      countryName = this.dataProvider_.getCountry(countryName).getName();
    }
    const country = this.dataProvider_.getCountryByName(countryName);

    // Remove empty strings
    location = location.filter(function (el) { return el != ''; });
    for (let i = 0; i < location.length - 1; i++) {
      // if (i == location.length - 1 && !!country) {
        // TODO: Restore link to country page.
        // locationSpan.push('<a target="_blank" href="/c/' +
        // country.getCode() + '/">' + location[i] + '</a>');
      // }
      locationSpan.push(location[i]);
    }
    locationSpan.push(countryName);
  }
  if (!locationSpan.length) {
    return;
  }

  totalCaseCount = props['total'];

  let content = document.createElement('div');
  console.log("location: ", locationSpan);
  content.innerHTML = '<h2 class="popup-title">' + locationSpan.join(', ') + '</h2>' +
    '<p class=popup-count>' + totalCaseCount.toLocaleString() + ' cases</p> ' +
    '<a class="popup" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + 
    locationSpan[2] +
    '%22&admin1=%22' + 
    locationSpan[1] + 
    '%22&admin2=%22' + 
    locationSpan[0] + 
    '%22">Explore Regional Data</a>';
  return content;
}

getLegendTitle() {
  return 'Cases';
}

getColorStops() {
  return [
    [MapView.COLORS[0], '< 100', 100],
    [MapView.COLORS[1], '100–1k', 1000],
    [MapView.COLORS[2], '1k–5k', 5000],
    [MapView.COLORS[3], '5k–20k', 20000],
    [MapView.COLORS[4], '20k-100k', 100000],
    [MapView.COLORS[5], '> 100k']
  ];
}

}  // CaseMapView
