/** @constructor */
let TimeAnimation = function(dataProvider) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;
};

/** @const */
TimeAnimation.ANIMATION_FRAME_DURATION_MS = 300;

TimeAnimation.prototype.init = function() {
  let timeControl = document.getElementById('slider');
  let self = this;
  timeControl.addEventListener('input', function() {
    self.setTimeControlLabel(timeControl.value);
    map.showDataAtDate(this.dataProvider.getDates()[timeControl.value]);
  });
};

TimeAnimation.prototype.updateTimeControl = function() {
  const dateCount = this.dataProvider_.getDates().length;
  // There's no point in showing the time control if we only have data for one
  // date.
  if (dateCount < 2) {
    return;
  }
  document.getElementById('range-slider').style.display = 'flex';
  timeControl.min = 0;
  timeControl.max = dateCount - 1;
  // Keep the slider at max value.
  timeControl.value = dateCount - 1;
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
      timeControl.value = i;
      showDataAtDate(dates[i]);
      this.setTimeControlLabel(i);
      i++;
      if (i === dates.length) {
        // We've reached the end.
        toggleMapAnimation(null);
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
