/** @constructor */
let TimeAnimation = function(dataProvider, caseMapView) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @private @const {CaseMapView} */
  this.caseMapView_ = caseMapView;

  /** @private {Element} */
  this.timeControl_ = null;
};

/** @const */
TimeAnimation.ANIMATION_FRAME_DURATION_MS = 300;

TimeAnimation.prototype.init = function() {
  this.timeControl_ = document.getElementById('slider');
  let playEl = document.getElementById('playpause');
  playEl.setAttribute('src', 'img/play.svg');
  playEl.onclick = this.toggleMapAnimation.bind(this);
  let self = this;
  this.timeControl_.addEventListener('input', function() {
    self.setTimeControlLabel(self.timeControl_.value);
    self.caseMapView_.onTimeChanged(self.dataProvider_.getDates()[self.timeControl_.value]);
  });
};

TimeAnimation.prototype.updateTimeControl = function() {
  const dateCount = this.dataProvider_.getDates().length;
  // There's no point in showing the time control if we only have data for one
  // date.
  if (dateCount < 2 || !this.timeControl_) {
    return;
  }
  document.getElementById('range-slider').style.display = 'flex';
  this.timeControl_.min = 0;
  this.timeControl_.max = dateCount - 1;
  // Keep the slider at max value.
  this.timeControl_.value = dateCount - 1;
  this.setTimeControlLabel(dateCount - 1);
}

TimeAnimation.prototype.setTimeControlLabel = function(index) {
  document.getElementById('date').innerText = this.dataProvider_.getDates()[index];
}

TimeAnimation.prototype.toggleMapAnimation = function(animationEndedCallback) {
  const shouldStart = !animationIntervalId;
  let dates = this.dataProvider_.getDates();
  document.getElementById('playpause').setAttribute('src', 'img/' +
      (shouldStart ? 'pause' : 'play') + '.svg');
  let self = this;
  if (shouldStart) {
    let i = 0;
    animationIntervalId = setInterval(function() {
      self.timeControl_.value = i;
      self.caseMapView_.onTimeChanged(dates[i]);
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
    clearInterval(animationIntervalId);
    animationIntervalId = 0;
  }
}
