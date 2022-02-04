/** @abstract */
class MapView extends View {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider);

  /** @protected @const {Nav} */
  this.nav_ = nav;

  /** @const @protected {DiseaseMap} */
  this.map_ = new DiseaseMap(this.dataProvider_, this, this.nav_);

  /** @private {SideBar} */
  this.sideBar_ = null;
}

isThreeDimensional() {
  return false;
}

fetchData() {
  let dp = this.dataProvider_;
  let self = this;
  let fetchHistoricalData = false;
  let superPromise = super.fetchData();
  const styleId = 'mapobox-style';
  if (!document.getElementById(styleId)) {
    let mapBoxStyle = document.createElement('link');
    mapBoxStyle.setAttribute('id', styleId);
    mapBoxStyle.setAttribute('href', 'https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css');
    mapBoxStyle.setAttribute('rel', 'stylesheet');
    document.body.appendChild(mapBoxStyle);
  }
  let dataPromise = new Promise(function(resolve, reject) {
    superPromise.then(function() {
      return dp.fetchLatestDailySlice.bind(dp)();
    }).then(function() { resolve(); });
  });
  let mapPromise = new Promise(function(resolve, reject) {
    const mapBoxId = 'mapbox';
    if (!!document.getElementById(mapBoxId)) {
      console.log('Mapbox script already present');
      resolve();
    }
    let mapBoxScript = document.createElement('script');
    mapBoxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js';
    mapBoxScript.setAttribute('id', mapBoxId);
    mapBoxScript.onload = () => resolve();
    document.body.appendChild(mapBoxScript);
  });
  return Promise.all([dataPromise, mapPromise]);
}

render() {
  super.render();
  let app = document.getElementById('app');
  app.innerHTML = '';
  let sideBarEl = document.createElement('div');
  sideBarEl.setAttribute('id', 'sidebar');
  this.sideBar_ = new SideBar(this.dataProvider_, this, sideBarEl);

  let mapEl = document.createElement('div');
  mapEl.setAttribute('id', 'map-wrapper');
  mapEl.innerHTML = '<div id="legend"><div id="legend-header"></div><ul class="list-reset"></ul></div><div id="map"></div>';
  app.appendChild(sideBarEl);
  app.appendChild(mapEl);
  this.onMapReady();

  this.sideBar_.render();
  this.sideBar_.renderCountryList();
  this.renderLogo();
}

onMapReady() {
  this.map_.init(this.nav_.getConfig('dark'));
}

onConfigChanged(config) {
  if (!this.isShown()) {
    return;
  }
  this.map_.setStyle(config['dark']);
}

flyToCountry(code) {
  this.map_.flyToCountry(code);
}

// redrawVariant(variant) {
//   this.map_.redrawVariant(variant);
// }

unload() {
  super.unload();
  this.map_.onUnload();
}

getType() {
  return this.isThreeDimensional() ? 'circle' : 'fill';
}

getColorStops() {
  return [];
}

getPropertyNameForPaint() {
  return 'cum_conf';
}

getPaintProperties(colors) {
  if (this.isThreeDimensional()) {
    return {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
          'property': 'total',
          'stops': [
            [100, 3],
            [1000, 4],
            [5000, 6],
            [20000, 8],
            [100000, 18],
            ]
          },
        'circle-opacity': 0.55,
        'circle-color': colors, 
        'circle-stroke-color': colors,
        'circle-stroke-width': 0.5,
        
      // 'fill-extrusion-height': ['get', 'height'],
      // 'fill-extrusion-color': colors,
      // 'fill-extrusion-opacity': 0.8,
    };
  } else {
    return {
      'fill-color': colors,
      'fill-outline-color': '#0074ab',
      'fill-opacity': 1,
    };
  }
}

getPaint() {
  let colors = ['step', ['get', this.getPropertyNameForPaint()]];
  const colorStops = this.getColorStops();
  for (let i = 0; i < colorStops.length; i++) {
    let color = colorStops[i];
    colors.push(color[0]);
    if (color.length > 2) {
      colors.push(color[2]);
    }
    if (color.length > 3) {
      colors.push(color[3]);
    }
  }
  console.log("err: ", this.getPaintProperties(colors));
  return this.getPaintProperties(colors);
}

/**
 * Returns the height to display for the given feature. This is only useful for
 * a 3D map.
 */
getHeightForFeature(feature) {
  return 0;
}

/** Returns the size (in x and y) of the map artifact shown for this feature. */
getSizeForFeature(feature) {
  return 0.3;
}

getFeatureSet() {
  // This is where the features stored in our local data store need to be
  // "re-hydrated" into features ingestible by the map.
  return this.formatFeatureSet([]);
}

getPopupContentsForFeature(f) {
  let contents = document.createElement('div');
  contents.innerHTML = 'Default pop-up content';
  return contents;
}

getLegendTitle() {
  return this.getTitle();
}

getLegendItems() {
  let items = [];
  const colors = this.getColorStops();
  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];
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

/**
 * Takes an array of features, and bundles them in a way that the map API
 * can ingest.
 */
formatFeatureSet(features) {
  return {'type': 'FeatureCollection', 'features': features};
}

/** Tweaks the given object to make it ingestable as a feature by the map API. */
formatFeature(inFeature, threeD) {
  // Make a deep copy.
  let feature = JSON.parse(JSON.stringify(inFeature));
  feature.type = 'Feature';
  if (!feature['properties']) {
    // This feature is missing key data, adding a placeholder.
    feature['properties'] = {'geoid': '0|0'};
  }
  // If the 'new' property is absent, assume 0.
  if (isNaN(feature['properties']['new'])) {
    feature['properties']['new'] = 0;
  }
  let coords = feature['properties']['geoid'].split('|');
  const lat = parseFloat(coords[1]);
  const lng = parseFloat(coords[0]);
  // Flip latitude and longitude.
  let featureCoords = [lng, lat];
  // if (threeD) {
  //   //const half = this.getSizeForFeature(inFeature) / 2;
  //   featureCoords = [[
  //     [lng, lat],
  //     [lng, lat],
  //     [lng, lat],
  //     [lng, lat],
  //     [lng, lat],
  //   ]];
  // }
  feature['geometry'] = {
    'type': 'Point',
    // 'type': 'Polygon',
    'coordinates': featureCoords,
  };
  if (threeD) {
    feature['properties']['height'] = this.getHeightForFeature(inFeature);
  }
  return feature;
}

}  // MapView

MapView.makeColorScale = function(topColor, midColor, bottomColor, numericalScale) {
  let scale = [];
  const count = numericalScale.length - 1;
  for (let i = 0; i < numericalScale.length; i++) {
    // Blend two color stops, either the first two or the last two.
    let ratio = i * 2 / count;
    let first = bottomColor;
    let second = midColor;
    if (i > count / 2) {
      ratio = (i - count / 2) * 2 / count;
      first = midColor;
      second = topColor;
    }
    const rgb = [
      Math.floor(first[0] * (1 - ratio) + second[0] * ratio),
      Math.floor(first[1] * (1 - ratio) + second[1] * ratio),
      Math.floor(first[2] * (1 - ratio) + second[2] * ratio),
    ];
    scale.push(['rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 1)',
                numericalScale[i]]);
  }
  return scale;
}

// Increasingly clear shades of blue.
MapView.COLORS = [
  '#88d0eb',
  '#64c6f0',
  '#51beec',
  '#29b1ea',
  '#0093e4',
  '#0074ab',
]

MapView.GREENCOLORS = [
  '#FFFFFF',
  '#ccece6',
  '#95d4ca',
  '#76cabd',
  '#54c1b1',
  '#39a896',
  '#398c7f',
]

MapView.REGIONCOLORS = [
  '#feffca',
  '#bfeab3',
  '#6ccfbb',
  '#00b9c4',
  '#0080ba',
  '#293395',
]
