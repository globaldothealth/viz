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

  /** @private {boolean} */
  this.firstRender_ = true;
}

showHistoricalData() {
  return false;
};

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
    }).then(function() {
      // } else {
        resolve();
      // }
    });
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
  mapEl.innerHTML = '<div id="legend"><div class="legend-header">Cases</div><ul class="list-reset"></ul></div><div id="map"></div>';
  app.appendChild(sideBarEl);
  app.appendChild(mapEl);
  this.onMapReady();

  this.sideBar_.render();
  this.sideBar_.renderCountryList();
  if (this.firstRender_) {
    this.sideBar_.toggle();
  }
  this.firstRender_ = false;
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

}
