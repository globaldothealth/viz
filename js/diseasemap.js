class DiseaseMap {

/**
 * @param {DataProvider} dataProvider
 * @param {MapView} view
 * @param {Nav} nav
 */
constructor(dataProvider, view, nav) {

  /** @private */
  this.mapboxMap_ = null;

  /** @private @const {MapView} */
  this.view_ = view;

  /** @private @const {Nav} */
  this.nav_ = nav;

  /** @private @type {Object} */
  this.popup_;

  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @private {string} */
  this.currentStyle_ = '';

  /**
   * Whether this maps needs a render. This is true before the first render, but
   * also after the map has been replaced by another view and will need
   * re-rendering when being shown again.
   * @private {boolean}
   */
  this.needsRender_ = true;

  // TODO: We might need to support several sources and several layers here.
  /** @private @string */
  this.sourceId_ = 'counts';

  /** @private @string */
  this.layerId_ = 'totals';
}

loadData() {
  this.setupSource();
  this.setupLayers();
  this.showDataAtLatestDate();
  this.attachEvents();
}

onUnload() {
  this.needsRender_ = true;
}
}

// This will be replaced at run time or deploy time.
DiseaseMap.MAPBOX_TOKEN = '{{MAPBOX_API_TOKEN}}';

DiseaseMap.LIGHT_THEME = 'mapbox://styles/healthmap/ckc1y3lbr1upr1jq6pwfcb96k';
DiseaseMap.DARK_THEME = 'mapbox://styles/healthmap/ck7o47dgs1tmb1ilh5b1ro1vn';

DiseaseMap.prototype.showDataAtLatestDate = function() {
  if (!this.dataProvider_.getDates().length) {
    return;
  }
  this.showDataAtDate(this.dataProvider_.getLatestDate());
}

DiseaseMap.prototype.showDataAtDate = function(isodate) {
  if (currentIsoDate != isodate) {
    currentIsoDate = isodate;
  }

  // If the map is ready, show the data. Otherwise it will be shown when
  // the map is finished loading.
  let source = this.mapboxMap_.getSource(this.sourceId_);
  if (!!source) {
    source.setData(this.view_.getFeatureSet());
  }
};

DiseaseMap.prototype.init = function(isDark) {
  mapboxgl.accessToken = DiseaseMap.MAPBOX_TOKEN;
  this.mapboxMap_ = new mapboxgl.Map({
    'container': 'map',
    'center': [10, 40],
    'minZoom': 1.5,
    'renderWorldCopies': false,
    'zoom': 2.5,
  }).addControl(new mapboxgl.NavigationControl());

  this.setStyle(isDark);

  let self = this;
  this.mapboxMap_.on('load', function () {
    self.loadData();
    if (self.view_.isThreeDimensional()) {
      self.mapboxMap_.easeTo({pitch: 55});
    }
    if (!!self.nav_.getConfig('focus')) {
      self.flyToCountry(/** @type {string} */ (self.nav_.getConfig('focus')));
    }
  });
  this.popup_ = new mapboxgl.Popup({
    'closeButton': false,
    'closeOnClick': true,
    'maxWidth': 'none',
  });

  this.showLegend();
};

DiseaseMap.prototype.setupSource = function() {
  if (!!this.mapboxMap_.getSource(this.sourceId_)) {
    return;
  }
  this.mapboxMap_.addSource(this.sourceId_, {
    'type': 'geojson',
    'data': this.view_.formatFeatureSet([])
  });
};

DiseaseMap.prototype.findFirstSymbolId = function() {
  var layers = this.mapboxMap_.getStyle()['layers'];
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  return firstSymbolId;
}

DiseaseMap.prototype.setupLayers = function() {
  if (!!this.mapboxMap_.getLayer(this.layerId_)) {
    return;
  }

  const firstSymbolId = this.findFirstSymbolId();
  this.mapboxMap_.addLayer({
    'id': this.layerId_,
    'type': this.view_.getType(),
    'source': this.sourceId_,
    'paint': this.view_.getPaint(),
  }, firstSymbolId);
  // TODO: we might want to restore the 'new' layer.
  // self.addLayer('daily', 'new', 'cornflowerblue');
};

DiseaseMap.prototype.attachEvents = function() {
  this.mapboxMap_.on('mouseenter', this.layerId_, function (e) {
    // Change the cursor style as a UI indicator.
    this.getCanvas().style.cursor = 'pointer';
  });

  this.mapboxMap_.on('click', this.layerId_, this.showPopupForEvent.bind(this));

  this.mapboxMap_.on('mouseleave', this.layerId_, function () {
    this.getCanvas().style.cursor = '';
  });
};

DiseaseMap.prototype.setStyle = function(isDark) {
  let newStyle = isDark ? DiseaseMap.DARK_THEME : DiseaseMap.LIGHT_THEME;
  if (this.currentStyle_ == newStyle && !this.needsRender_) {
    return;
  }
  this.needsRender_ = false;
  let self = this;
  // Not sure why we need to reload the data after a style change.
  this.mapboxMap_.on('styledata', function () {
    self.loadData();
    if (self.view_.isThreeDimensional()) {
      self.mapboxMap_.easeTo({pitch: 55});
    }
  });
  this.mapboxMap_.setStyle(newStyle);
  this.currentStyle_ = newStyle;
}


/**
 * Navigates the map to the given country.
 * @param {string} code The code of the country to fly to.
 */
DiseaseMap.prototype.flyToCountry = function(code) {
  const country = this.dataProvider_.getCountry(code);
  const dest = country.getMainBoundingBox();
  this.mapboxMap_.fitBounds([[dest[0], dest[1]], [dest[2], dest[3]]]);
  this.nav_.setConfig('focus', code);
};

DiseaseMap.prototype.showPopupForEvent = function(e) {
  if (!e['features'].length) {
    // We can't do much without a feature.
    return;
  }

  let f = e['features'][0];
  let props = f['properties'];
  const geo_id = props['geoid'];
  let coordinatesString = geo_id.split('|');
  const lat = parseFloat(coordinatesString[0]);
  const lng = parseFloat(coordinatesString[1]);

  const contents = this.view_.getPopupContentsForFeature(f);

  // Restore this if we decide to render multiple "world copies" again.
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  // while (Math.abs(e['lngLat']['lng'] - lng) > 180) {
    // lng += e['lngLat']['lng'] > lng ? 360 : -360;
  // }
  this.popup_.setLngLat([lng, lat]).setDOMContent(contents);
  this.popup_.addTo(this.mapboxMap_);
  let self = this;
  this.popup_.getElement().onmouseleave = function() {
    self.popup_.remove();
  };
}

DiseaseMap.prototype.showLegend = function() {
  document.getElementById('legend-header').textContent =
      this.view_.getLegendTitle();
  let list = document.getElementById('legend').getElementsByTagName('ul')[0];
  list.innerHTML = '';
  let items = this.view_.getLegendItems();
  for (let i = 0; i < items.length; i++) {
    list.appendChild(items[i]);
  }
};
