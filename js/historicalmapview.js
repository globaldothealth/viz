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
}

showHistoricalData() {
  return true;
};

onMapAnimationEnded() {
  let self = this;
  let ta = this.timeAnimation_;
  if (autoDriveMode) {
    // Let the last frame last for a few seconds before restarting.
    setTimeout(function() {
      ta.toggleMapAnimation(self.onMapAnimationEnded.bind(self));
    }, 2000);
  }
}
}
