class CaseMapView extends View {

constructor(dataProvider) {
  super(dataProvider);

  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @const @private {DiseaseMap} */
  this.map_ = new DiseaseMap(this.dataProvider_);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = new TimeAnimation(this.dataProvider_, this);

  /** @const @private {SideBar} */
  this.sideBar_ = new SideBar(this.dataProvider_, this);
}

isDataReady() {
  return false;
}

fetchData() {
  // Once the initial data is here, fetch the daily slices. Start with the
  // newest.
  let dp = this.dataProvider_;
  let self = this;
  return this.dataProvider_.fetchInitialData().
      then(dp.fetchLatestDailySlice.bind(dp)).
      then(function() {
      // The page is now interactive and showing the latest data. If we need to
      // focus on a given country, do that now.
      if (!!initialFlyTo) {
        self.flyToCountry(initialFlyTo);
      }
      self.sideBar_.renderCountryList();
      // At this point the dates only contain the latest date.
      // Show the latest data when we have that before fetching older data.
      //map.showDataAtDate(self.dataProvider_.getLatestDate());
      // Give a bit of time for the map to show before fetching other slices.
      window.setTimeout(function() {
        dp.fetchDailySlices(
        // Update the time control UI after each daily slice.
        self.timeAnimation_.updateTimeControl.bind(self.timeAnimation_));
      }, 2000);
    });
}

render() {
  super.render();
}

}

CaseMapView.prototype.getTitle = function() {
  return 'Case Map';
};

CaseMapView.prototype.init = function() {
  let ta = this.timeAnimation_;
  ta.init();
  document.getElementById('spread').
      addEventListener('click', ta.toggleMapAnimation.bind(ta));

  this.map_.init();
  this.fetchData();
  let self = this;
  document.getElementById('sidebar-tab').onclick = toggleSideBar;
  document.getElementById('percapita').addEventListener('change', function(e) {
    self.sideBar_.updateCountryListCounts();
  });
  toggleSideBar();
};

/** @param {string} date */
CaseMapView.prototype.onTimeChanged = function(date) {
  this.map_.showDataAtDate(date);
};


CaseMapView.prototype.flyToCountry = function(code) {
  this.map_.flyToCountry(initialFlyTo);
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
  this.map_.setStyle(darkTheme);
};
