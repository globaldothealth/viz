/** @constructor @implements {View} */
let CaseMapView = function(dataProvider) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @const @private {DiseaseMap} */
  this.map_ = new DiseaseMap(this.dataProvider_);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = new TimeAnimation(this.dataProvider_);

  /** @const @private {SideBar} */
  this.sideBar_ = new SideBar(this.dataProvider_);
};

CaseMapView.prototype.init = function() {
  let ta = this.timeAnimation_;
  ta.init();
  document.getElementById('spread').
      addEventListener('click', ta.toggleMapAnimation.bind(ta));

  this.map_.init();
  this.fetchData();
  document.getElementById('sidebar-tab').onclick = toggleSideBar;
  document.getElementById('percapita').addEventListener('change', function(e) {
    self.sideBar_.updateCountryListCounts();
  });
  toggleSideBar();
};

CaseMapView.prototype.fetchData = function() {
  // Once the initial data is here, fetch the daily slices. Start with the
  // newest.
  let dp = this.dataProvider_;
  let self = this;
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
      //map.showDataAtDate(self.dataProvider_.getLatestDate());
      // Give a bit of time for the map to show before fetching other slices.
      window.setTimeout(function() {
        dp.fetchDailySlices(
        // Update the time control UI after each daily slice.
        self.timeAnimation_.updateTimeControl.bind(self.timeAnimation_));
      }, 2000);
    });

};

CaseMapView.prototype.render = function() {
};


CaseMapView.prototype.onThemeChanged = function(darkTheme) {
  this.map_.setStyle(darkTheme);
};
