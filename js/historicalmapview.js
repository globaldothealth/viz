class HistoricalMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new HistoricalMapDataSource(dataProvider), nav);

  /** @const @private {TimeAnimation} */
  this.timeAnimation_ = new TimeAnimation(this.dataProvider_, this);
}

getId() {
  return 'historicalmap';
}

getTitle() {
  return '🗺  Historical';
};

isThreeDimensional() {
  return true;
}

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

getFeatureSet() {
  let dehydratedFeatures = this.dataProvider_.getAtomicFeaturesForDay(currentIsoDate);
  return this.formatFeatureSet(dehydratedFeatures.map(
      f => this.formatFeature(f, true /* 3D */)));
}

getPopupContentsForFeature(f) {
  const container = document.createElement('div');
  const parent = super.getPopupContentsForFeature(f);
  container.appendChild(parent);

  const geo_id = f['properties']['geoid'];
  let relevantFeaturesByDay = {};
  const dates = this.dataProvider_.getDates();
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    relevantFeaturesByDay[date] = [];
    const atomicFeatures = this.dataProvider_.getAtomicFeaturesForDay(date);
    if (!atomicFeatures) {
      continue;
    }
    for (let j = 0; j < atomicFeatures.length; j++) {
      const feature = atomicFeatures[j];
      if (!feature) {
        continue;
      }
      if (feature['properties']['geoid'] == geo_id) {
        relevantFeaturesByDay[date].push(feature);
      }
    }
  }

  let graphContainer = document.createElement('div');
  graphContainer.classList.add('chart');
  Graphing.makeCasesGraph(
      DataProvider.convertGeoJsonFeaturesToGraphData(
          relevantFeaturesByDay, 'total'), false /* average */,
          graphContainer);
  container.appendChild(graphContainer);

  return container;
}

}  // HistoricalMapView
