
/** @constructor */
let DataProvider = function(baseUrl) {
  /** @const @private {string} */
  this.baseUrl_ = baseUrl;

  /** @private {!Set.<string>} */
  this.dates_ = new Set();

  /**
   * A map from 2-letter ISO country codes to country objects.
   * @private {!Object}
   */
  this.countries_ = {};

  /**
   * A map from country names to country objects.
   * @private {Object}
   */
  this.countriesByName_ = {};

  // An object mapping dates to JSON objects with the corresponding data.
  // for that day, grouped by country, province, or ungrouped (smallest
  // granularity level).
  /** @private */
  this.countryFeaturesByDay_ = {};

  /** @private */
  this.provinceFeaturesByDay_ = {};

  /** @private */
  this.cityFeaturesByDay_ = {};

  /**
   * A map from country names to most recent data (case count, etc.), or
   * null if this hasn't been calculated yet.
   * @private
   */
  this.latestDataPerCountry_ = null;

  /**
   * @private {Array.<number>} The latest global counts, in this order:
   * confirmed cases, deaths, date of last update.
   */
  this.latestGlobalCounts_ = [];

  /**
   * An object whose keys are the names of the data slice files, and whose
   * values are whether the corresponding slice still has been fetched.
   * @const @private {!Object.<boolean>}
   */
  this.dataSliceFileNames_ = {};

  /**
    * An object whose keys are ISO-formatted dates, and values are mapping
    * between country codes and aggregated data (total case count, deaths,
    * etc.). This is null if and only if the data is absent.
    * @type {Object}
    * @private
    */
  this.aggregateData_;
};

/**
 * This takes an Object whose keys are date string, and values are arrays of
 * GeoJSON-style features. It returns an Object with the following properties:
 * - 'dates' maps to an array of length N containing sorted date strings
 * - 'geoids' maps to an array containing unique geoids for this set
 * - for each geoid in the input data set, a key of this geoid maps to an
 *   array of length N containing corresponding values. A missing value is
 *   represented by 'null'.
 */
DataProvider.convertGeoJsonFeaturesToGraphData = function(datesToFeatures, prop) {
  let o = {};
  let dates = new Set();
  let geoids = new Set();
  for (let date in datesToFeatures) {
    dates.add(date);
  }
  o['dates'] = Array.from(dates).sort();

  for (let i = 0; i < o['dates'].length; i++) {
    const date = o['dates'][i];
    for (let j = 0; j < datesToFeatures[date].length; j++) {
      const feature = datesToFeatures[date][j];
      const geoid = feature['properties']['geoid'];
      if (!!geoid) {
        geoids.add(geoid);
      }
    }
  }
  o['geoids'] = Array.from(geoids);

  for (let i = 0; i < o['geoids'].length; i++) {
    const geoid = o['geoids'][i];
    if (!o[geoid]) {
      o[geoid] = [];
    }
    for (let j = 0; j < o['dates'].length; j++) {
      const date = o['dates'][j];
      let added = false;
      let k = 0;
      while (!added && k < datesToFeatures[date].length) {
        const feature = datesToFeatures[date][k];
        if (feature['properties']['geoid'] == geoid) {
          if (feature['properties'].hasOwnProperty(prop)) {
            o[geoid].push(feature['properties'][prop]);
            added = true;
            break;
          }
        }
        k++;
      }
      if (!added) {
        o[geoid].push(null);
      }
    }
  }
  return o;
}


DataProvider.prototype.getLatestDateWithAggregateData = function() {
  if (!this.aggregateData_) {
    return null;
  }
  let dates = Object.keys(this.aggregateData_);
  return dates.sort()[dates.length - 1];
}

DataProvider.prototype.getLatestDataPerCountry = function() {
  if (!this.latestDataPerCountry_) {
    this.latestDataPerCountry_ = {};
    const latestAggregateData = this.getLatestAggregateData();
    if (!latestAggregateData) {
      return null;
    }
    for (let i = 0; i < latestAggregateData.length; i++) {
      const item = latestAggregateData[i];
      this.latestDataPerCountry_[item['code']] = [item['cum_conf']];
    }
  }
  return this.latestDataPerCountry_;
};


DataProvider.prototype.getCountryFeaturesForDay = function(date) {
  return this.countryFeaturesByDay_[date];
};


DataProvider.prototype.getLatestAggregateData = function() {
  if (!this.aggregateData_) {
    return null;
  }
  return this.aggregateData_[this.getLatestDateWithAggregateData()];
}

DataProvider.prototype.getAggregateData = function() {
  return this.aggregateData_;
}

/** @return {Array.<string>} */
DataProvider.prototype.getDates = function() {
  let dates = Array.from(this.dates_).sort();
  return dates;
};

/** @return {string} */
DataProvider.prototype.getLatestDate = function() {
  if (!this.dates_.size) {
    return '';
  }
  let dates = Array.from(this.dates_).sort();
  return dates[dates.length - 1];
};

/** @return {Country} */
DataProvider.prototype.getCountry = function(code) {
  return this.countries_[code];
};

/** @return {Country} */
DataProvider.prototype.getCountryByName = function(name) {
  return this.countriesByName_[name];
};

/** @return {Object} */
DataProvider.prototype.getCountries = function() {
  return this.countries_;
};

DataProvider.prototype.fetchInitialData = function() {
  const self = this;
  return Promise.all([
    this.fetchLatestCounts(false /* forceRefresh */),
    this.fetchCountryNames(),
    this.fetchDataIndex(),
    this.fetchLocationData(),
    this.fetchJhuData()
  ]);
};


/** @return {!Promise} */
DataProvider.prototype.fetchDailySlices = function(eachSliceCallback) {
  let dailyFetches = [];
  let fileNames = Object.keys(this.dataSliceFileNames_);
  console.log(fileNames);
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    if (!!this.dataSliceFileNames_[fileName]) {
      continue;
    }
    let thisPromise = this.fetchDailySlice(fileName, false /* isNewest */);
    dailyFetches.push(thisPromise.then(eachSliceCallback));
  }
  if (!dailyFetches.length) {
    return Promise.resolve();
  }
  return Promise.all(dailyFetches).then(function() { });
};


/**
 * Loads the location data (geo names from latitude and longitude).
 * @return {!Promise}
 */
DataProvider.prototype.fetchLocationData = function() {
  return fetch(this.baseUrl_ + 'location_info.data')
    .then(function(response) { return response.text(); })
    .then(function(responseText) {
      let lines = responseText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(':');
        locationInfo[parts[0]] = parts[1];
      }
    });
};


/** @return {!Promise} */
DataProvider.prototype.fetchDataIndex = function() {
  let self = this;
  return fetch(this.baseUrl_ + '/d/index.txt')
    .then(function(response) { return response.text(); })
    .then(function(responseText) {
      let lines = responseText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!!line) {
          if (!self.dataSliceFileNames_[line]) {
            self.dataSliceFileNames_[line] = false;
          }
        }
      }
    });
};


/** @return {!Promise} */
DataProvider.prototype.fetchCountryNames = function() {
  let countryCount = Object.keys(this.countries_).length;
  if (!!countryCount) {
    return Promise.resolve();
  }
  let self = this;
  return fetch('https://raw.githubusercontent.com/ghdsi/common/master/countries.data')
    .then(function(response) { return response.text(); })
    .then(function(responseText) {
      let countryLines = responseText.trim().split('\n');
      for (let i = 0; i < countryLines.length; i++) {
        let parts = countryLines[i].split(':');
        const continent = parts[0];
        const code = parts[1];
        const name = parts[2];
        const population = parseInt(parts[3], 10) || 0;
        let bboxParts = parts[4].split('|');
        let bboxes = [];
        for (let j = 0; j < bboxParts.length; j++) {
            let bbox = bboxParts[j].split(',');
            bboxes.push(bbox);
        }
        let c = new Country(code, name, continent, population, bboxes);
        self.countries_[code] = c;
        self.countriesByName_[name] = c;
      }
    });
};


/**
 * Loads the latest case counts from the scraper.
 * @param forceRefresh Whether to fetch the latest counts even if we have some
 *     numbers locally.
 * @return {!Promise}
 */
DataProvider.prototype.fetchLatestCounts = function(forceRefresh) {
  if (!forceRefresh && !!this.latestGlobalCounts_.length) {
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  return fetch(this.baseUrl_ + 'latestCounts.json?nocache=' + timestamp)
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      const counts = jsonData[0];
      self.latestGlobalCounts_ = [parseInt(counts['caseCount'], 10),
                                  parseInt(counts['deaths'], 10),
                                  counts['date']];
      const totalCasesEl = document.getElementById('total-cases');
      const totalDeathsEl = document.getElementById('total-deaths');
      const lastUpdatedDateEl = document.getElementById('last-updated-date');
      if (!!totalCasesEl) {
        totalCasesEl.innerText = self.latestGlobalCounts_[0].toLocaleString();
      }
      if (!!totalDeathsEl) {
        totalDeathsEl.innerText = self.latestGlobalCounts_[1].toLocaleString();
      }
      if (!!lastUpdatedDateEl) {
        lastUpdatedDateEl.innerText = self.latestGlobalCounts_[2];
      }
    });
};


/**
 * Loads the appropriate country-specific data.
 * @return {!Promise}
 */
DataProvider.prototype.loadCountryData = function() {
  const code = document.getElementById('dash').getAttribute('c');
  let self = this;
  return this.fetchLocationData().then(function() {
    return fetch(self.baseUrl_ + 'c/' + code + '.json'); }).
        then(function(response) { return response.json(); });
}


/** @return {!Promise} */
DataProvider.prototype.fetchLatestDailySlice = function() {
  let fileNames = Object.keys(this.dataSliceFileNames_);
  fileNames.sort();
  return this.fetchDailySlice(fileNames[fileNames.length - 1],
                              true /* isNewest */);
}

/**
 * Fetches the next daily slice of data we need. If no argument is provided,
 * fetches the latest slice first.
 * @return {!Promise}
 */
DataProvider.prototype.fetchDailySlice = function(sliceFileName, isNewest) {
  if (!!this.dataSliceFileNames_[sliceFileName]) {
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  let url = this.baseUrl_ + 'd/' + sliceFileName;
  // Don't cache the most recent daily slice. Cache all others.
  if (isNewest) {
    url += '?nocache=' + timestamp;
  }
  return fetch(url)
      .then(function(response) {
          return response.status == 200 ? response.json() : undefined;
      })
      .then(function(jsonData) {
        if (!jsonData) {
          return;
        }
        self.processDailySlice(jsonData, isNewest);
  });
};


DataProvider.prototype.processDailySlice = function(jsonData, isNewest) {
  let currentDate = jsonData['date'];
  let features = jsonData['features'];

  // Cases grouped by country and province.
  let provinceFeatures = {};
  let countryFeatures = {};

  // "Re-hydrate" the features into objects ingestable by the map.
  for (let i = 0; i < features.length; i++) {
    let feature = DiseaseMap.formatFeature(features[i]);

    // If we don't know where this is, discard.
    if (!locationInfo[feature['properties']['geoid']]) {
      continue;
    }
    // City, province, country.
    const locationStr = locationInfo[feature['properties']['geoid']];
    let location = locationStr.split('|');
    const countryCode = location[2];
    if (!countryCode || countryCode.length != 2) {
      console.log('Warning: invalid country code: ' + countryCode);
      console.log('From ' + location);
    }
    if (!provinceFeatures[location[1]]) {
      provinceFeatures[location[1]] = {'total': 0, 'new': 0};
    }
    provinceFeatures[location[1]]['total'] += feature['properties']['total'];
    provinceFeatures[location[1]]['new'] += feature['properties']['new'];
    if (!countryFeatures[countryCode]) {
      countryFeatures[countryCode] = {'total': 0, 'new': 0};
    }
    countryFeatures[countryCode]['total'] += feature['properties']['total'];
    countryFeatures[countryCode]['new'] += feature['properties']['new'];
  }

  this.dates_.add(currentDate);

  this.countryFeaturesByDay_[currentDate] = countryFeatures;
  this.provinceFeaturesByDay_[currentDate] = provinceFeatures;
  atomicFeaturesByDay[currentDate] = features;
  this.dataSliceFileNames_[currentDate + '.json'] = true;
};


DataProvider.prototype.fetchJhuData = function() {
  if (!!this.aggregateData_) {
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  return fetch(this.baseUrl_ + 'aggregate.json?nocache=' + timestamp)
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      self.aggregateData_ = {};
      for (let date in jsonData) {
        // Ignore empty data for a given date.
        if (jsonData[date].length > 0) {
          self.dates_.add(date);
          self.aggregateData_[date] = jsonData[date];
        }
      }
    });
}


DataProvider.prototype.getCompletenessData = function(callback) {
}
