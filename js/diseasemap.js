class DiseaseMap {

/**
 * @param {DataProvider} dataProvider
 * @param {MapDataSource} dataSource
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
}

onUnload() {
  this.needsRender_ = true;
}
}

DiseaseMap.MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVhbHRobWFwIiwiYSI6ImNrOGl1NGNldTAyYXYzZnBqcnBmN3RjanAifQ.H377pe4LPPcymeZkUBiBtg';

DiseaseMap.THREE_D_FEATURE_SIZE_IN_LATLNG = 0.4;

DiseaseMap.LIGHT_THEME = 'mapbox://styles/healthmap/ckc1y3lbr1upr1jq6pwfcb96k';
DiseaseMap.DARK_THEME = 'mapbox://styles/healthmap/ck7o47dgs1tmb1ilh5b1ro1vn';

/** Tweaks the given object to make it ingestable as a feature by the map API. */
DiseaseMap.formatFeature = function(feature) {
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
  const featureType = twoDMode ? 'Point' : 'Polygon';
  const lat = parseFloat(coords[0]);
  const lng = parseFloat(coords[1]);
  // Flip latitude and longitude.
  let featureCoords = [lng, lat];
  if (!twoDMode) {
    const half = DiseaseMap.THREE_D_FEATURE_SIZE_IN_LATLNG / 2;
    featureCoords = [[
      [lng + half, lat + half],
      [lng - half, lat + half],
      [lng - half, lat - half],
      [lng + half, lat - half],
      [lng + half, lat + half],
    ]];
  }
  feature['geometry'] = {
    'type': featureType,
    'coordinates': featureCoords,
  };
  if (!twoDMode) {
    feature['properties']['height'] = 10 * Math.sqrt(100000 * feature['properties']['total']);
  }
  return feature;
};


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
  let featuresToShow = this.dataProvider_.getAtomicFeaturesForDay(isodate);

  // If the map is ready, show the data. Otherwise it will be shown when
  // the map is finished loading.
  let source = this.mapboxMap_.getSource('counts');
  if (!!source) {
    source.setData(MapDataSource.formatFeatureSet(featuresToShow));
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
    self.setupSource();
    self.setupLayers();
    self.showDataAtLatestDate();
    self.attachEvents();
    if (!twoDMode) {
      self.mapboxMap_.easeTo({pitch: 55});
    }
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
  const sourceId = 'counts';
  if (!!this.mapboxMap_.getSource(sourceId)) {
    return;
  }
  this.mapboxMap_.addSource(sourceId, {
    'type': 'geojson',
    'data': MapDataSource.formatFeatureSet([])
  });
};

DiseaseMap.prototype.setupLayers = function() {
  const layerId = 'totals';
  if (!!this.mapboxMap_.getLayer(layerId)) {
    return;
  }
  let circleColorForTotals = ['step', ['get', 'total']];
  // Don't use the last color here (for new cases).
  for (let i = 0; i < CaseMapDataSource.COLORS.length - 1; i++) {
    let color = CaseMapDataSource.COLORS[i];
    circleColorForTotals.push(color[0]);
    if (color.length > 2) {
      circleColorForTotals.push(color[2]);
    }
  }
  this.addLayer('totals', 'total', circleColorForTotals);
  //self.addLayer('daily', 'new', 'cornflowerblue');
};

DiseaseMap.prototype.attachEvents = function() {
  this.mapboxMap_.on('mouseenter', 'totals', function (e) {
    // Change the cursor style as a UI indicator.
    this.getCanvas().style.cursor = 'pointer';
  });

  this.mapboxMap_.on('click', 'totals', this.showPopupForEvent.bind(this));

  this.mapboxMap_.on('mouseleave', 'totals', function () {
    this.getCanvas().style.cursor = '';
  });
};

DiseaseMap.prototype.setStyle = function(isDark) {
  let newStyle = isDark ? DiseaseMap.DARK_THEME : DiseaseMap.LIGHT_THEME;
  if (this.currentStyle_ == newStyle && !this.needsRender_) {
    return;
  }
  // Not sure why we need to reload the data after a style change.
  this.needsRender_ = false;
  let self = this;
  this.mapboxMap_.on('styledata', function () {
    self.setupSource();
    self.setupLayers();
    self.showDataAtLatestDate();
    if (!twoDMode) {
      self.mapboxMap_.easeTo({pitch: 55});
    }
  });
  this.mapboxMap_.setStyle(newStyle);
  this.currentStyle_ = newStyle;
}

DiseaseMap.prototype.addLayer = function(id, featureProperty, circleColor) {
  const type = twoDMode ? 'circle ' : 'fill-extrusion';
  // const type = threeDMode ? 'fill' : 'circle';
  let paint = {
    'circle-radius': [
      'case', ['<', 0, ['number', ['get', featureProperty]]],
      ['*', ['log10', ['sqrt', ['get', featureProperty]]], 5],
      0],
    'circle-color': circleColor,
    'circle-opacity': 0.6,
  };
  if (!twoDMode) {
    paint = {
      // 'fill-extrusion-base': 0,
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-color': circleColor,
      'fill-extrusion-opacity': 0.8,
    };
  }

  this.mapboxMap_.addLayer({
    'id': id,
    'type': type,
    'source': 'counts',
    'paint': paint
  });
};


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

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e['lngLat']['lng'] - lng) > 180) {
    lng += e['lngLat']['lng'] > lng ? 360 : -360;
  }
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
