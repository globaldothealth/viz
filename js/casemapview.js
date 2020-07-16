class CaseMapView extends View {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider);

  /** @private {boolean} */
  this.historicalData_ = false;

  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @private @const {Nav} */
  this.nav_ = nav;

  /** @const @private {DiseaseMap} */
  this.map_ = new DiseaseMap(this.dataProvider_, this);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = this.historicalData_ ?
    new TimeAnimation(this.dataProvider_, this) : null;

  /** @private {SideBar} */
  this.sideBar_ = null;
}

getId() {
  return 'casemap';
}

getTitle() {
  return 'Case Map';
};

fetchData() {
  let dp = this.dataProvider_;
  let self = this;
  let fetchHistoricalData = false;
  const styleId = 'mapobox-style';
  if (!document.getElementById(styleId)) {
    let mapBoxStyle = document.createElement('link');
    mapBoxStyle.setAttribute('id', styleId);
    mapBoxStyle.setAttribute('href', 'https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css');
    mapBoxStyle.setAttribute('rel', 'stylesheet');
    document.body.appendChild(mapBoxStyle);
  }
  let dataPromise = new Promise(function(resolve, reject) {
    dp.fetchInitialData.bind(dp)().then(function() {
      return dp.fetchLatestDailySlice.bind(dp)();
    }).then(function() {
      // At this point the dates only contain the latest date.
      // Show the latest data when we have that before fetching older data.
      //map.showDataAtDate(self.dataProvider_.getLatestDate());
      if (fetchHistoricalData) {
        dp.fetchDailySlices(
        // Update the time control UI after each daily slice.
        self.timeAnimation_.updateTimeControl.bind(self.timeAnimation_)).then(
          function() {
            resolve();
          }
        );
      } else {
        resolve();
      }
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
  console.log('Returning case map promises');
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
  mapEl.className = 'map-wrapper';
  mapEl.innerHTML = '<div id="legend"><div class="legend-header">Cases</div><ul class="list-reset"></ul></div><div id="map"></div>';
  app.appendChild(sideBarEl);
  app.appendChild(mapEl);
  this.onMapReady();

  this.sideBar_.render();
  this.sideBar_.renderCountryList();
  this.sideBar_.toggle();
  if (!!this.timeAnimation_) {
    this.timeAnimation_.render();
  }

  // The page is now interactive and showing the latest data. If we need to
  // focus on a given country, do that now.
  if (!!initialFlyTo) {
    this.flyToCountry(initialFlyTo);
  }
}

}

CaseMapView.prototype.onMapReady = function() {
  this.map_.init(this.nav_.getConfig('dark'));
};

/** @param {string} date */
CaseMapView.prototype.onTimeChanged = function(date) {
  this.map_.showDataAtDate(date);
};


CaseMapView.prototype.flyToCountry = function(code) {
  this.map_.flyToCountry(code);
};

CaseMapView.prototype.onMapAnimationEnded = function() {
  let self = this;
  let ta = this.timeAnimation_;
  if (autoDriveMode) {
    // Let the last frame last for a few seconds before restarting.
    setTimeout(function() {
      ta.toggleMapAnimation(self.onMapAnimationEnded.bind(self));
    }, 2000);
  }
}

CaseMapView.prototype.onThemeChanged = function(darkTheme) {
  if (!this.isShown()) {
    return;
  }
  this.map_.setStyle(darkTheme);
};
