// Constants
const ANIMATION_FRAME_DURATION_MS = 300;
const LIVE_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const COLOR_MAP = [
  ['#67009e', '< 10', 10],
  ['#921694', '11–100', 100],
  ['#d34d60', '101–500', 500],
  ['#fb9533', '501–2000', 2000],
  ['#edf91c', '> 2000'],
  ['cornflowerblue', 'New'],
];
const TOGGLES = [
  ['3D Map', '3d'],
  ['Auto-drive', 'autodrive'],
  ['Dark Theme', 'dark'],
];

// Globals
let dataProvider;
let locationInfo = {};
// A map from 2-letter ISO country codes to country objects.
let countries = {};
// A map from country names to country objects.
let countriesByName = {};
let dates = [];
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

let timeControl;


function setTimeControlLabel(date) {
  document.getElementById('date').innerText = dates[date];
}

/** Fills with leading zeros to the desired width. */
function zfill(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function onAllDailySlicesFetched() {
}


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

function showLegend() {
  let list = document.getElementById('legend').getElementsByTagName('ul')[0];
  for (let i = 0; i < COLOR_MAP.length; i++) {
    let color = COLOR_MAP[i];
    let item = document.createElement('li');
    let circle = document.createElement('span');
    circle.className = 'circle';
    circle.style.backgroundColor = color[0];
    let label = document.createElement('span');
    label.className = 'label';
    label.textContent = color[1];
    item.appendChild(circle);
    item.appendChild(label);
    list.appendChild(item);
  }
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

function onMapAnimationEnded() {
  if (autoDriveMode) {
    // Let the last frame last for a few seconds before restarting.
    setTimeout(function() {
      toggleMapAnimation(onMapAnimationEnded);
    }, 2000);
  }
}

function onAllDataFetched() {
  dates = dates.sort();
  if (autoDriveMode) {
    toggleMapAnimation(onMapAnimationEnded);
  }
}

function init() {
  dataProvider = new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/');
  timeControl = document.getElementById('slider');
  map = new DiseaseMap();
  map.init();

  window.onhashchange = function(h) {
    console.log('Hash change ' + h.newURL);
    // processHash(h.oldURL, h.newURL);
  }
  setupTopBar();
  //processHash('', window.location.href);
  document.getElementById('sidebar-tab').onclick = toggleSideBar;
  document.getElementById('percapita').addEventListener('change', function(e) {
    updateCountryListCounts();
  });
  toggleSideBar();

  // Once the initial data is here, fetch the daily slices. Start with the
  // newest.
  dataProvider.fetchInitialData().
      then(dataProvider.fetchLatestDailySlice()).
      then(function() {
      // The page is now interactive and showing the latest data. If we need to
      // focus on a given country, do that now.
      if (!!initialFlyTo) {
        map.flyToCountry(initialFlyTo);
      }
      renderCountryList();
      // At this point the 'dates' array only contains the latest date.
      // Show the latest data when we have that before fetching older data.
      map.showDataAtDate(dates[0]);
      dataProvider.fetchDailySlices(onAllDataFetched);
    });
  // Get the basic data about locations before we can start getting daily
  // slices.

  document.getElementById('spread').
      addEventListener('click', toggleMapAnimation);
  document.getElementById('playpause').setAttribute('src', 'img/play.svg');
  window.setTimeout(updateData, LIVE_UPDATE_INTERVAL_MS);
}

function updateData() {
  console.log('Updating data...');
  dataProvider.fetchLatestCounts().then(function() {
    console.log('Updated latest counts.');
  });
  dataProvider.fetchDataIndex().then(function() {
    console.log('Updated data index.');
  });

  // Update the data again after another time interval.
  window.setTimeout(updateData, LIVE_UPDATE_INTERVAL_MS);
}

// Exports
if (typeof(globalThis) === 'undefined' && typeof(global) !== "undefined") {
    globalThis = global;
}
globalThis['fetchAboutPage'] = fetchAboutPage;
globalThis['init'] = init;
