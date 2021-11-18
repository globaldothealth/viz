class CaseMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);
}

getId() {
  return 'region';
}

getTitle() {
  return 'Regional View';
}

isThreeDimensional() {
  return true;
}

fetchData() {
  const dp = this.dataProvider_;
  return super.fetchData().then(dp.fetchRegionalData.bind(dp));
}

getPropertyNameForPaint() {
  return 'total';
}

getHeightForFeature(feature) {
  // return 10 * Math.sqrt(100000 * feature['properties']['total'])
  return 10000 * Math.log10(10000000 * feature['properties']['total']);
}

getFeatureSet() {
  const latestDate = this.dataProvider_.getLatestDate();
  const regiondata = this.dataProvider_.getRegionalData();
  let features = [];
  let current = Object.keys(regiondata);
  let regions = regiondata[current];
  for (let i = 0; i < regions.length; i++) {
    let geoId = [regions[i]['long'], regions[i]['lat']].join('|');
    let casecount  = regions[i]['casecount'];
    let feature = {
      'properties': {
        'geoid': geoId,
        'total': casecount,
        'radius': casecount,
        'region': regions[i]['_id'],
        'region_level': regions[i]['search'],
        'country': regions[i]['country']
      }
    };
    features.push(feature);
  }
  return this.formatFeatureSet(features.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getPopupContentsForFeature(f) {
  let props = f['properties'];
  const geo_id = props['geoid'];
  const regionLevel = props['region_level']; 
  const regionName = props['region'];
  const countryName = props['country'];

  let totalCaseCount = 0;

  // Country, province, city
  let locationSpan = [];
  locationSpan.push(regionName, countryName);
  totalCaseCount = props['total'];

  let content = document.createElement('div');
  content.innerHTML = '<h2 class="popup-title">' + regionName + ', ' + countryName + '</h2>' +
    '<p class=popup-count>' + totalCaseCount.toLocaleString() + ' cases</p> ' +
    '<a class="popup" target="_blank" href="{{LINE_LIST_URL}}/cases?country=%22' + 
    countryName +
    '%22&' + regionLevel + '=%22' + 
    regionName + 
    '%22">Explore Regional Data</a>';
  return content;
}

getLegendTitle() {
  return 'Cases';
}

getColorStops() {
  return [
    [MapView.REGIONCOLORS[0], '< 100', 100],
    [MapView.REGIONCOLORS[1], '100–1k', 1000],
    [MapView.REGIONCOLORS[2], '1k–5k', 5000],
    [MapView.REGIONCOLORS[3], '5k–20k', 20000],
    [MapView.REGIONCOLORS[4], '20k-100k', 100000],
    [MapView.REGIONCOLORS[5], '> 100k']
  ];
}

}  // CaseMapView
