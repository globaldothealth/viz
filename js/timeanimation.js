class TimeAnimation {

constructor(dataProvider, mapView) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @private @const {HistoricalMapView} */
  this.mapView_ = mapView;

  /** @private {Element} */
  this.timeControl_ = null;

  /**
   * The ID number of the current animation interval, or zero if no interval is
   * in progress.
   * @private {number}
   */
  this.animationIntervalId_ = 0;
}
}

/** @const */
TimeAnimation.ANIMATION_FRAME_DURATION_MS = 300;

TimeAnimation.prototype.render = function() {
  let mapWrapper = document.getElementById('map-wrapper');
  let rangeSliderEl = document.createElement('div');
  rangeSliderEl.setAttribute('id', 'range-slider');
  rangeSliderEl.innerHTML = '<div id="spread"><img id="playpause" width="40" height="40" alt="Play" /></div><input id="slider" type="range" value="1000" min="0" max="1000" step="1" /><label><span id="date"></span></label>';
  mapWrapper.appendChild(rangeSliderEl);
  this.timeControl_ = document.getElementById('slider');
  let playEl = document.getElementById('playpause');
  playEl.setAttribute('src', 'img/play.svg');
  let cb = this.mapView_.onMapAnimationEnded.bind(this.mapView_);
  playEl.onclick = this.toggleMapAnimation.bind(this, cb);
  let self = this;
  // document.getElementById('spread').
      // addEventListener('click', this.toggleMapAnimation.bind(this));
  this.timeControl_.addEventListener('input', function() {
    self.setTimeControlLabel(self.timeControl_.value);
    self.mapView_.onTimeChanged(self.dataProvider_.getDates()[self.timeControl_.value]);
  });
};

TimeAnimation.prototype.updateTimeControl = function() {
  const dateCount = this.dataProvider_.getDates().length;
  // There's no point in showing the time control if we only have data for one
  // date.
  if (dateCount < 2 || !this.timeControl_) {
    return;
  }
  let rangeSliderEl = document.getElementById('range-slider');
  if (!!rangeSliderEl) {
    // We might have switched to another view by now.
    rangeSliderEl.style.display = 'flex';
  }
  this.timeControl_.min = 0;
  this.timeControl_.max = dateCount - 1;
  // Keep the slider at max value.
  this.timeControl_.value = dateCount - 1;
  this.setTimeControlLabel(dateCount - 1);
}

TimeAnimation.prototype.setTimeControlLabel = function(index) {
  let dateEl = document.getElementById('date');
  if (!!dateEl) {
    dateEl.innerText = this.dataProvider_.getDates()[index];
  }
}

TimeAnimation.prototype.toggleMapAnimation = function(animationEndedCallback) {
  const shouldStart = !this.animationIntervalId_;
  let dates = this.dataProvider_.getDates();
  document.getElementById('playpause').setAttribute('src', 'img/' +
      (shouldStart ? 'pause' : 'play') + '.svg');
  let self = this;
  if (shouldStart) {
    let i = 0;
    this.animationIntervalId_ = setInterval(function() {
      self.timeControl_.value = i;
      self.mapView_.onTimeChanged(dates[i]);
      self.setTimeControlLabel(i);
      i++;
      if (i === dates.length) {
        // We've reached the end.
        self.toggleMapAnimation(null);
        if (!!animationEndedCallback) {
          animationEndedCallback();
        }
      }
    }, TimeAnimation.ANIMATION_FRAME_DURATION_MS);
  } else {
    clearInterval(this.animationIntervalId_);
    this.animationIntervalId_ = 0;
  }
}
