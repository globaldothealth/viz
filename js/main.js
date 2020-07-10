let viz = null;

function bootstrap() {
  viz = new Viz();
  viz.init();
}

/** @constructor */
let Viz = function() {

  /** @const @private {DataProvider} */
  this.dataProvider_ = new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/');

  /** @const @private {SideBar} */
  this.sideBar_ = new SideBar(this.dataProvider_);

  /** @const @private {Completeness} */
  this.completeness_ = new Completeness(this.dataProvider_);

  /** @const @private {Rank} */
  this.rank_ = new Rank(this.dataProvider_);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = new TimeAnimation(this.dataProvider_);
};

/** @const */
Viz.LIVE_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Globals
let locationInfo = {};
// A map from country names to country objects.
let countriesByName = {};
let map;
let autoDriveMode = false;
let threeDMode = false;
let darkTheme = false;
let initialFlyTo;

let currentIsoDate;
let currentDateIndex = 0;
let animationIntervalId = 0;
let currentTouchY = -1;

let atomicFeaturesByDay = {};

function fetchAboutPage() {
  fetch('https://raw.githubusercontent.com/ghdsi/covid-19/master/about.html')
    .then(function(response) { return response.text(); })
    .then(function(html) { handleShowModal(html); });
}

function handleShowModal(html) {
  let modal = document.getElementById('modal');
  let modalWrapper = document.getElementById('modal-wrapper');
  // Switch elements to have 'display' value (block, flex) but keep hidden via
  // opacity
  modalWrapper.classList.add('is-block');
  modal.classList.add('is-flex');
  setTimeout(function () {
    // for transition
    modalWrapper.classList.add('is-visible');
    modal.classList.add('is-visible');
  }, 40);
  modal.innerHTML = html;
  // Attach an event to the close button once this is finished rendering.
  setTimeout(function() {
    document.getElementById('modal-cancel').onclick = handleHideModal;
  }, 0);
}

function handleHideModal() {
  let modal = document.getElementById('modal');
  let modalWrapper = document.getElementById('modal-wrapper');
  modalWrapper.classList.remove('is-visible');
  modal.classList.remove('is-visible');
  setTimeout(function () {
    // for transition
    modalWrapper.classList.remove('is-block');
    modal.classList.add('is-flex');
  }, 400);
}

function flyToCountry(event) {
  let target = event.target;
  while (!target.getAttribute('country')) {
    target = target.parentNode;
  }
  const code = target.getAttribute('country');
  if (!code) {
    return;
  }
  map.flyToCountry(code);
}

function showDataAtDate(iso_date) {
  map.showDataAtDate(iso_date);
}

Viz.prototype.onMapAnimationEnded = function() {
  let self = this;
  if (autoDriveMode) {
    // Let the last frame last for a few seconds before restarting.
    setTimeout(function() {
      this.timeAnimation_.toggleMapAnimation(self.onMapAnimationEnded.bind(self));
    }, 2000);
  }
}

Viz.prototype.onAllDataFetched = function() {
  if (autoDriveMode) {
    this.timeAnimation_.toggleMapAnimation(this.onMapAnimationEnded.bind(this));
  }
}

Viz.prototype.init = function() {
  map = new DiseaseMap(this.dataProvider_);
  map.init();
  this.timeAnimation_.init();

  let self = this;
  window.onhashchange = function(h) {
    console.log('Hash change ' + h.newURL);
    // processHash(h.oldURL, h.newURL);
  }
  setupTopBar();
  //processHash('', window.location.href);
  document.getElementById('sidebar-tab').onclick = toggleSideBar;
  document.getElementById('percapita').addEventListener('change', function(e) {
    self.sideBar_.updateCountryListCounts();
  });
  toggleSideBar();

  // Once the initial data is here, fetch the daily slices. Start with the
  // newest.
  let dp = this.dataProvider_;
  this.dataProvider_.fetchInitialData().
      then(dp.fetchLatestDailySlice.bind(dp)).
      then(function() {
      // The page is now interactive and showing the latest data. If we need to
      // focus on a given country, do that now.
      if (!!initialFlyTo) {
        map.flyToCountry(initialFlyTo);
      }
      self.sideBar_.renderCountryList();
      // At this point the dates only contain the latest date.
      // Show the latest data when we have that before fetching older data.
      map.showDataAtDate(self.dataProvider_.getLatestDate());
      dp.fetchDailySlices(
        // Update the time control UI after each daily slice.
        self.timeAnimation_.updateTimeControl.bind(self.timeAnimation_));
    });
  // Get the basic data about locations before we can start getting daily
  // slices.

  document.getElementById('spread').
      addEventListener('click', this.timeAnimation_.toggleMapAnimation);
  document.getElementById('playpause').setAttribute('src', 'img/play.svg');
  document.getElementById('credit').onclick = fetchAboutPage;
  window.setTimeout(updateData, Viz.LIVE_UPDATE_INTERVAL_MS);
}

function updateData() {
  console.log('Updating data...');
  this.dataProvider_.fetchLatestCounts().then(function() {
    console.log('Updated latest counts.');
  });
  this.dataProvider_.fetchDataIndex().then(function() {
    console.log('Updated data index.');
  });

  // Update the data again after another time interval.
  window.setTimeout(updateData, Viz.LIVE_UPDATE_INTERVAL_MS);
}

// Exports
if (typeof(globalThis) === 'undefined' && typeof(global) !== "undefined") {
    globalThis = global;
}
globalThis['bootstrap'] = bootstrap;
