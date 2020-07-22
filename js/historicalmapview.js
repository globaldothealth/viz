class HistoricalMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, nav);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = new TimeAnimation(this.dataProvider_, this);
}

getId() {
  return 'historicalmap';
}

getTitle() {
  return 'Historical Map';
};

render() {
  super.render();
  this.timeAnimation_.render();

  let self = this;

  // For the historical map, we also want to get data from the past, but
  // we do this after we're done rendering the main map.
  window.setTimeout(function() {
    document.head.title = 'Loading...';
    self.dataProvider_.fetchDailySlices(
      // Update the time control UI after each daily slice.
      self.timeAnimation_.updateTimeControl.bind(self.timeAnimation_)).then(function() {
        document.head.title = self.getTitle();
        if (self.nav_.getConfig('autodrive')) {
          self.toggleAnimation();
        }
      });
  }, 1000);
}

showHistoricalData() {
  return true;
}

/** @param {string} date */
onTimeChanged(date) {
  this.map_.showDataAtDate(date);
}

toggleAnimation() {
  let self = this;
  this.timeAnimation_.toggleMapAnimation(function() {
    // Start again when we're done, if we're still in autodrive.
    window.setTimeout(function() {
      if (self.nav_.getConfig('autodrive')) {
        self.toggleAnimation();
      }
    }, 2000);
  });
}

onMapAnimationEnded() {
  let self = this;
  let ta = this.timeAnimation_;
  if (this.nav_.getConfig('autodrive')) {
    // Let the last frame last for a few seconds before restarting.
    setTimeout(function() {
      ta.toggleMapAnimation(self.onMapAnimationEnded.bind(self));
    }, 2000);
  }
}
}
