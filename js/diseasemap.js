class DiseaseMap {

/**
 * @param {DataProvider} dataProvider
 * @param {!MapDataSource} dataSource
 * @param {MapView} view
 * @param {Nav} nav
 */
constructor(dataProvider, dataSource, view, nav) {

  /** @private */
  this.mapboxMap_ = null;

  /** @private @const {!MapDataSource} */
  this.dataSource_ = dataSource;

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

DiseaseMap.MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVhbHRobWFwIiwiYSI6ImNrOGl1NGNldTAyYXYzZnBqcnBmN3RjanAifQ.H377pe4LPPcymeZkUBiBtg';

DiseaseMap.THREE_D_FEATURE_SIZE_IN_LATLNG = 0.4;

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
    source.setData(this.dataSource_.getFeatureSet());
  }
};

DiseaseMap.prototype.init = function(isDark) {
  mapboxgl.accessToken = DiseaseMap.MAPBOX_TOKEN;
  this.mapboxMap_ = new mapboxgl.Map({
    'container': 'map',
    'center': [10, 0],
    'minZoom': 1.5,
    'renderWorldCopies': false,
    'zoom': 2.5,
  }).addControl(new mapboxgl.NavigationControl());

  this.setStyle(isDark);

  let self = this;
  this.mapboxMap_.on('load', function () {
    self.loadData();
    // TODO: Don't do this in 2D mode.
    self.mapboxMap_.easeTo({pitch: 55});
    if (!!self.nav_.getConfig('focus')) {
      self.flyToCountry(self.nav_.getConfig('focus'));
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
    'data': MapDataSource.formatFeatureSet([])
  });
};

DiseaseMap.prototype.setupLayers = function() {
  if (!!this.mapboxMap_.getLayer(this.layerId_)) {
    return;
  }

  this.mapboxMap_.addLayer({
    'id': this.layerId_,
    'type': this.dataSource_.getType(),
    'source': this.sourceId_,
    'paint': this.dataSource_.getPaint(),
  });
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
    // TODO: Don't do this in 2D mode.
    self.mapboxMap_.easeTo({pitch: 55});
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
  let geo_id = props['geoid'];
  let coordinatesString = geo_id.split('|');
  let lat = parseFloat(coordinatesString[0]);
  let lng = parseFloat(coordinatesString[1]);

  let totalCaseCount = 0;
  // Country, province, city
  let location = locationInfo[geo_id].split('|');
  // Replace country code with name if necessary
  if (location[2].length == 2) {
    location[2] = this.dataProvider_.getCountry(location[2]).getName();
  }
  const countryName = location[2];
  const country = this.dataProvider_.getCountryByName(countryName);

  // Remove empty strings
  location = location.filter(function (el) { return el != ''; });
  let locationSpan = [];
  for (let i = 0; i < location.length; i++) {
    if (i == location.length - 1 && !!country) {
      // TODO: Restore link to country page.
      // locationSpan.push('<a target="_blank" href="/c/' +
                        // country.getCode() + '/">' + location[i] + '</a>');
      locationSpan.push(location[i]);
    } else {
      locationSpan.push(location[i]);
    }
  }
  totalCaseCount = props['total'];

  let content = document.createElement('div');
  content.innerHTML = '<h3 class="popup-header"><span>' +
        locationSpan.join(', ') + '</span>: ' + totalCaseCount.toLocaleString() + '</h3>';

  if (this.view_.showHistoricalData()) {
    let relevantFeaturesByDay = {};
    const dates = this.dataProvider_.getDates();
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      relevantFeaturesByDay[date] = [];
      const atomicFeatures = this.dataProvider_.getAtomicFeaturesForDay(date);
      for (let j = 0; j < atomicFeatures.length; j++) {
        const feature = atomicFeatures[j];
        if (!feature) {
          continue;
        }
        if (feature['properties']['geoid'] == geo_id) {
          relevantFeaturesByDay[date].push(feature);
        }
      }
    }

    let container = document.createElement('div');
    container.classList.add('chart');
    Graphing.makeCasesGraph(
        DataProvider.convertGeoJsonFeaturesToGraphData(
            relevantFeaturesByDay, 'total'), false /* average */, container,
        countryName);
    content.appendChild(container);
  }

  // Restore this if we decide to render multiple "world copies" again.
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  // while (Math.abs(e['lngLat']['lng'] - lng) > 180) {
    // lng += e['lngLat']['lng'] > lng ? 360 : -360;
  // }
  this.popup_.setLngLat([lng, lat]).setDOMContent(content);
  this.popup_.addTo(this.mapboxMap_);
  let self = this;
  this.popup_.getElement().onmouseleave = function() {
    self.popup_.remove();
  };
}

DiseaseMap.prototype.showLegend = function() {
  document.getElementById('legend-header').textContent =
      this.dataSource_.getLegendTitle();
  let list = document.getElementById('legend').getElementsByTagName('ul')[0];
  list.innerHTML = '';
  let items = this.dataSource_.getLegendItems();
  for (let i = 0; i < items.length; i++) {
    list.appendChild(items[i]);
  }
};
