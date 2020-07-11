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

  /** @const @private {Nav} */
  this.nav_ = new Nav(this);

  /** @const @private {CaseMapView} */
  this.caseMapView_ = new CaseMapView(this.dataProvider_);

  /** @const @private {CompletenessView} */
  this.completeness_ = new CompletenessView(this.dataProvider_);

  /** @const @private {RankView} */
  this.rank_ = new RankView(this.dataProvider_);

  /** @const @private {SyncView} */
  this.sync_ = new SyncView(this.dataProvider_);
};

/** @const */
Viz.LIVE_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Globals
let locationInfo = {};
let autoDriveMode = false;
let twoDMode = false;
let darkTheme = false;
let initialFlyTo;

let currentIsoDate;
let currentDateIndex = 0;
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

// function showDataAtDate(iso_date) {
  // map.showDataAtDate(iso_date);
// }

// Viz.prototype.onAllDataFetched = function() {
  // if (autoDriveMode) {
    // this.timeAnimation_.toggleMapAnimation(this.onMapAnimationEnded.bind(this));
  // }
// }

Viz.prototype.init = function() {

  this.caseMapView_.init();
  this.caseMapView_.prepareAndRender();

  this.nav_.setupTopBar();

  let self = this;
  window.onhashchange = function(h) {
    console.log('Hash change ' + h.newURL);
    self.nav_.processHash(h.oldURL, h.newURL);
  }

  document.getElementById('credit').onclick = fetchAboutPage;
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
}

Viz.prototype.updateData = function() {
  console.log('Updating data...');
  this.dataProvider_.fetchLatestCounts().then(function() {
    console.log('Updated latest counts.');
  });
  this.dataProvider_.fetchDataIndex().then(function() {
    console.log('Updated data index.');
  });

  // Update the data again after another time interval.
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
};

Viz.prototype.onThemeChanged = function(darkMode) {
  /** @type {Array.<View>} */
  const views = [this.caseMapView_, this.sync_, this.completeness_, this.rank_];
  for (let i = 0; i < views.length; i++) {
    views[i].onThemeChanged(darkMode);
  }
}

// Exports
if (typeof(globalThis) === 'undefined' && typeof(global) !== "undefined") {
    globalThis = global;
}
globalThis['bootstrap'] = bootstrap;
