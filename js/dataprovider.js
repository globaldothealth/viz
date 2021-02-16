/**
 * The data provider is responsible for fetching data from the server, and for
 * keeping it in memory. Only one instance of it is meant to exist in the
 * application's life time.
 */
class DataProvider {

/** @param baseUrl The URL to get data from. */
constructor(baseUrl) {
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
   * A map from 2-letter ISO country codes to precise country boundaries.
   * @private {!Object}
   */
  this.countryBoundaries_ = {};

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

  this.atomicFeaturesByDay_ = {};

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
    * @private {Object}
    */
  this.aggregateData_;

  /**
    * @private {Object}
   */
  this.freshnessData_;

  /**
    * @private {Object}
   */
  this.regionalData_;
}
}  // DataProvider

DataProvider.LAT_LNG_DECIMAL_LENGTH = 4;

DataProvider.normalizeGeoId = function(lat, long) {
  let output = [];
  output.push(parseFloat(lat).toFixed(DataProvider.LAT_LNG_DECIMAL_LENGTH));
  output.push(parseFloat(long).toFixed(DataProvider.LAT_LNG_DECIMAL_LENGTH));
  return output.join('|');
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

/**
  * @return {string} The latest date for which non-empty aggregate data is
  *     available, or the empty string if no aggregate data has been fetched
  *     yet.
  */
DataProvider.prototype.getLatestDateWithAggregateData = function() {
  if (!this.aggregateData_) {
    return "";
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
      this.latestDataPerCountry_[item['_id']] = [item['caseCount']];
    }
  }
  return this.latestDataPerCountry_;
};


DataProvider.prototype.getCountryFeaturesForDay = function(date) {
  return this.countryFeaturesByDay_[date];
};


DataProvider.prototype.getAtomicFeaturesForDay = function(date) {
  return this.atomicFeaturesByDay_;
};


DataProvider.prototype.getLatestGlobalCounts = function() {
  return this.latestGlobalCounts_;
};

DataProvider.prototype.getLatestAggregateData = function() {
  if (!this.aggregateData_) {
    return null;
  }
  return this.aggregateData_[this.getLatestDateWithAggregateData()];
}

DataProvider.prototype.getAggregateData = function() {
  return this.aggregateData_;
};

DataProvider.prototype.getFreshnessData = function() {
  return this.freshnessData_;
};

DataProvider.prototype.getRegionalData = function() {
  return this.regionalData_;
};

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

/** @return {!Object} */
DataProvider.prototype.getCountries = function() {
  return this.countries_;
};

/** @return {!Object} */
DataProvider.prototype.getBoundariesForCountry = function(code) {
  return this.countryBoundaries_[code];
};

/**
 * @return {!Promise} A promise to return all the necessary basic data needed
 *     for most views.
 */
DataProvider.prototype.fetchInitialData = function() {
  const self = this;
  return Promise.all([
    this.fetchLatestCounts(false /* forceRefresh */),
    this.fetchCountryNames(),
    this.fetchDataIndex(),
    this.fetchLocationData(),
    this.fetchAggregateData()
  ]);
};


/**
 * @param {Function} eachSliceCallback A function to call after each daily slice
 *     has been retrieved.
 * @return {!Promise} A promise to fetch all available daily slices.
 */
DataProvider.prototype.fetchDailySlices = function(eachSliceCallback) {
  let dailyFetches = [];
  let fileNames = Object.keys(this.dataSliceFileNames_);
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    if (!!this.dataSliceFileNames_[fileName]) {
      continue;
    }
    let thisPromise = this.fetchDailySlice(
      fileName, false /* isNewest */, eachSliceCallback);
    dailyFetches.push(thisPromise);
  }
  if (!dailyFetches.length) {
    eachSliceCallback();
    return Promise.resolve();
  }
  return Promise.all(dailyFetches);
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
  return new Promise(function(resolve, reject) {
    fetch(self.baseUrl_ + 'regional/index.txt').then(function(response) {
        return response.text();
      }).then(function(responseText) {
        let lines = responseText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!!line) {
            if (!self.dataSliceFileNames_[line]) {
              self.dataSliceFileNames_[line] = false;
            }
          }
        }
        resolve();
      }).
      catch(function(msg) { console.error(msg); });
    });
};


/** @return {!Promise} */
DataProvider.prototype.fetchFreshnessData = function() {
  if (!!this.freshnessData_ && !!this.freshnessData_.length) {
    console.log('Freshness data already loaded.');
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  return fetch(this.baseUrl_ + '/freshness.json?nocache=' + timestamp)
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      self.freshnessData_ = jsonData;
    });
};

/** @return {!Promise} */
DataProvider.prototype.fetchCountryNames = function() {
  let countryCount = Object.keys(this.countries_).length;
  if (!!countryCount) {
    return Promise.resolve();
  }
  let self = this;
  return fetch('https://raw.githubusercontent.com/globaldothealth/common/master/countries.data')
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
        const centroid = c.getCentroid();
        locationInfo['' + centroid[1] + '|' + centroid[0]] = '||' + code;
      }
    });
};

/** @return {!Promise} */
DataProvider.prototype.fetchCountryBoundaries = function() {
  let boundaries = Object.keys(this.countryBoundaries_).length;
  if (!!boundaries) {
    return Promise.resolve();
  }
  let self = this;
  return fetch('https://raw.githubusercontent.com/globaldothealth/common/master/country_boundaries.json')
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      for (let i = 0; i < jsonData.length; i++) {
        let datum = jsonData[i];
        self.countryBoundaries_[datum['code']] = datum['geometry'];
      }
    });
}

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
  return fetch(this.baseUrl_ + 'total/latest.json?nocache=' + timestamp)
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      const counts = jsonData;
      self.latestGlobalCounts_ = [parseInt(counts['total'], 10),
                                  parseInt(counts['deaths'], 10),
                                  counts['date']];
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
                              true /* isNewest */, function() {});
}

/**
 * Fetches the next daily slice of data we need. If no argument is provided,
 * fetches the latest slice first.
 * @return {!Promise}
 */
DataProvider.prototype.fetchDailySlice = function(
    sliceFileName, isNewest, callback) {
  if (!!this.dataSliceFileNames_[sliceFileName]) {
    console.log('Already have ' + sliceFileName);
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  let url = this.baseUrl_ + 'country/latest-voc.json';
  // Don't cache the most recent daily slice. Cache all others.
  if (isNewest) {
    url += '?nocache=' + timestamp;
  }
  return new Promise(function(resolve, reject) {
    fetch(url).then(function(response) {
      if (response.status != 200) {
        reject('Bad response status ' + response.status + ' for ' + url);
      }
      return response.json();
    }).then(function(jsonData) {
      if (!jsonData) {
        reject('JSON data is empty');
      }
      self.processDailySlice(jsonData, isNewest);
      callback();
      resolve();
    });
  });
};

/** @return {!Promise} */
DataProvider.prototype.fetchRegionalData = function() {
  if (!!this.regionalData_ && !!this.regionalData_.length) {
    console.log('Freshness data already loaded.');
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  let url = this.baseUrl_ + 'regional/latest.json?nocache=' + timestamp;
  // Don't cache the most recent daily slice. Cache all others.
  return fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(jsonData) {
      self.regionalData_ = jsonData;
    });

};

DataProvider.prototype.processDailySlice = function(jsonData, isNewest) {

  let currentDate = Object.keys(jsonData);
  let features = jsonData[currentDate];

  // Cases grouped by country
  let countryFeatures = {};

  // "Re-hydrate" the features into objects ingestable by the map.
  for (let i = 0; i < features.length; i++) {
    let feature = features[i];
    feature['geoid'] = DataProvider.normalizeGeoId(
        feature['lat'], feature['long']);

    // If we don't know where this is, discard.
    if (!locationInfo[feature['geoid']]) {
      continue;
    }
    // City, province, country.
    const locationStr = locationInfo[feature['geoid']];
    let location = locationStr.split('|');
    // The country code is the last element.
    let countryCode = location.slice(-1)[0];
    if (!countryCode || countryCode.length != 2) {
      console.log('Warning: invalid country code: ' + countryCode);
      console.log('From ' + location);
    }
    if (!countryFeatures[countryCode]) {
      countryFeatures[countryCode] = {'total': 0, 'new': 0};
    }
    countryFeatures[countryCode]['name'] = feature['_id'];
    countryFeatures[countryCode]['geoid'] = feature['geoid'];
    countryFeatures[countryCode]['total'] = feature['casecount'];
    countryFeatures[countryCode]['variant1'] = feature['voc1'];
    countryFeatures[countryCode]['variant2'] = feature['voc2'];
    countryFeatures[countryCode]['variant3'] = feature['voc3'];
    countryFeatures[countryCode]['jhu'] = feature['jhu'];
  }

  this.dates_.add(currentDate);

  this.countryFeaturesByDay_[currentDate] = countryFeatures;
  console.log(countryFeatures);
  // this.atomicFeaturesByDay_[currentDate] = features;
  this.dataSliceFileNames_[currentDate + '.json'] = true;
};


DataProvider.prototype.fetchAggregateData = function() {
  if (!!this.aggregateData_) {
    return Promise.resolve();
  }
  const timestamp = (new Date()).getTime();
  let self = this;
  return fetch(this.baseUrl_ + 'total/latest.json?nocache=' + timestamp)
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
