/** @constructor */
let TimeAnimation = function(dataProvider) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @private {Element} */
  this.timeControl_ = null;
};

/** @const */
TimeAnimation.ANIMATION_FRAME_DURATION_MS = 300;

TimeAnimation.prototype.init = function() {
  this.timeControl_ = document.getElementById('slider');
  console.log(this.timeControl_);
  let self = this;
  this.timeControl_.addEventListener('input', function() {
    self.setTimeControlLabel(self.timeControl_.value);
    map.showDataAtDate(this.dataProvider.getDates()[this.timeControl_.value]);
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
  if (shouldStart) {
    let i = 0;
    animationIntervalId = setInterval(function() {
      this.timeControl_.value = i;
      showDataAtDate(dates[i]);
      this.setTimeControlLabel(i);
      i++;
      if (i === dates.length) {
        // We've reached the end.
        this.toggleMapAnimation(null);
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
