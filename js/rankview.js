class RankView extends View {

constructor(dataProvider, nav) {
  super(dataProvider);

  /** @private @const {Nav} */
  this.nav_ = nav;

  /** @private {number} */
  this.maxGraphedValue_ = 0;

  /** @private {boolean} */
  this.showDeathCounts_ = false;

  /** @private {boolean} */
  this.logScale_ = true;

  /** @private {number} */
  this.currentDateIndex_ = 0;

  /** @private {number} */
  this.minDateIndex_ = 0;
}

getId() {
  return 'rank';
}

getTitle() {
  return 'Rank';
}

setEarliestDateIndexWithAggregateData() {
  let data = this.dataProvider_.getAggregateData();
  const dates = this.dataProvider_.getDates();
  let date = dates[this.minDateIndex_];
  while (!data[date]) {
    this.minDateIndex_++;
    date = dates[this.minDateIndex_];
  }
}

makeViewToggle(id, firstLabel, secondLabel, callback) {
  let toggleEl = document.createElement('div');
  toggleEl.classList.add('inview-toggle');
  toggleEl.setAttribute('id', id);
  toggleEl.innerHTML = '<div class="active">' + firstLabel + '</div>' +
      '<div>' + secondLabel + '</div>';
  toggleEl.onclick = callback;
  return toggleEl;
}

render() {
  super.render();
  this.setEarliestDateIndexWithAggregateData();
  this.currentDateIndex_ = this.minDateIndex_;
  const container = document.getElementById('app');
  container.innerHTML = '<h1>Rank</h1><h2>Scroll to advance.</h2>';
  const toggles = document.createElement('div');
  toggles.classList.add('toggles');
  toggles.appendChild(this.makeViewToggle('cases-deaths', 'Cases', 'Deaths',
      this.onToggleClicked.bind(this)));
  toggles.appendChild(this.makeViewToggle('log-linear', 'Logarithmic scale', 'Linear scale',
      this.onToggleClicked.bind(this)));
  container.appendChild(toggles);
  const contents = document.createElement('div');
  contents.setAttribute('id', 'rank_content');
  contents.textContent = 'Loading...';
  const miniMap = document.createElement('div');
  miniMap.setAttribute('id', 'minimap');
  contents.innerHTML = '';

  container.appendChild(contents);
  container.appendChild(miniMap);

  maxWidth = Math.floor(contents.clientWidth);

  let i = 0;
  let countries = this.dataProvider_.getCountries();
  for (let code in countries) {
    const c = countries[code];
    let el = document.createElement('div');
    el.setAttribute('id', code);
    el.classList.add('bar');
    const color = RankView.CONTINENT_COLORS[c.getContinent()];
    el.style.backgroundColor = color;
    el.style.color = '#fff';
    let startSpan = document.createElement('span');
    startSpan.classList.add('start');
    let endSpan = document.createElement('span');
    endSpan.classList.add('end');
    startSpan.textContent = c.getName();
    startSpan.style.backgroundColor = color;
    el.appendChild(endSpan);
    el.appendChild(startSpan);
    contents.appendChild(el);
    i++;
  }

  this.setUpScale();
  this.showRankPageAtCurrentDate();

  let self = this;
  contents.onwheel = function(e) {
    self.onRankWheel(e);
  };
  contents.ontouchmove = function(e) {
    e.preventDefault();
    self.onRankTouchMove(e['touches'][0].clientY - currentTouchY)
  };
  contents.ontouchstart = function(e) {
    e.preventDefault();
    currentTouchY = e['touches'][0].clientY;
  }
  contents.ontouchend = function(e) {
    e.preventDefault();
    currentTouchY = -1;
  }

  let toggle = document.getElementById('cases-deaths');
  // Assume only two modes here.
  toggle.firstChild.onclick = this.onToggleClicked.bind(this);
  toggle.lastChild.onclick = this.onToggleClicked.bind(this);

  if (this.nav_.getConfig('autodrive')) {
    this.rankAdvance(true, 1);
  }
}

setUpScale() {
  const aggregates = this.dataProvider_.getAggregateData();
  const key = this.showDeathCounts_ ? 'deaths' : 'cum_conf';
  let maxValue = 0;
  let dates = Object.keys(aggregates).sort();

  for (let date in aggregates) {
    for (let country in aggregates[date]) {
      maxValue = Math.max(maxValue, aggregates[date][country][key]);
    }
  }
  if (this.logScale_) {
    this.maxGraphedValue_ = Math.log10(maxValue);
  } else {
    this.maxGraphedValue_ = maxValue;
  }
}

onConfigChanged(config) {
  if (!this.isShown()) {
    return;
  }
  if (this.nav_.getConfig('autodrive')) {
    this.rankAdvance(true, 1);
  }
}

}

RankView.CONTINENT_COLORS = {
  'O': '#b600ff',  // purple
  'S': '#0c1fb4',  // dark blue
  'N': '#0060ff',  // blue
  'E': '#00b31a',  // green
  'A': '#bb9900',  // yellow
  'P': '#e37300',  // orange
  'Z': '#e90000',  // red
};

let maxWidth = 0;

RankView.prototype.onToggleClicked = function(e) {
  let toggle = e.target;
  while (!toggle.classList || !toggle.classList.contains('inview-toggle')) {
    toggle = toggle.parentNode;
  }
  if (!toggle) {
    // This click probably wasn't for us.
    return;
  }
  if (toggle.firstChild == e.target) {
    toggle.firstChild.classList.add('active');
    toggle.lastChild.classList.remove('active');
    if (toggle.getAttribute('id') == 'cases-deaths') {
      this.showDeathCounts_ = false;
    } else {
      this.logScale_ = true;
    }
  } else if (toggle.lastChild == e.target) {
    toggle.firstChild.classList.remove('active');
    toggle.lastChild.classList.add('active');
    if (toggle.getAttribute('id') == 'cases-deaths') {
      this.showDeathCounts_ = true;
    } else {
      this.logScale_ = false;
    }
  }
  this.setUpScale();
  this.showRankPageAtCurrentDate();
}

RankView.prototype.onRankTouchMove = function(delta) {
  const points_per_step = 150;
  this.rankAdvance(delta > 0, Math.floor(Math.abs(delta / points_per_step)));
}

RankView.prototype.onRankWheel = function(e) {
  e.preventDefault();
  this.rankAdvance(e.deltaY > 0, 1);
}

RankView.prototype.rankAdvance = function(forward, steps) {
  if (!this.isShown()) {
    return;
  }
  let newDateIndex = this.currentDateIndex_ + (forward ? steps : -steps);
  const maxDateIndex = this.dataProvider_.getDates().length -1;
  newDateIndex = Math.max(newDateIndex, this.minDateIndex_);
  let autodriveLatency = 100;
  if (newDateIndex >= maxDateIndex) {
      newDateIndex = maxDateIndex;
  }
  this.currentDateIndex_ = newDateIndex;
  this.showRankPageAtCurrentDate();
  if (this.currentDateIndex_ == maxDateIndex && this.nav_.getConfig('autodrive')) {
    // We're in autodrive mode and reached the end. Start over after a short
    // wait.
    this.currentDateIndex_ = this.minDateIndex_;
    autodriveLatency = 2000;
  }
  let self = this;
  if (this.nav_.getConfig('autodrive')) {
    window.setTimeout(function() {
      self.rankAdvance.bind(self)(true, 1);
    }, autodriveLatency);
  }
}

RankView.prototype.showRankPageAtCurrentDate = function() {
  const date = this.dataProvider_.getDates()[this.currentDateIndex_];
  document.getElementsByTagName('h1')[0].textContent = date;
  const data = this.dataProvider_.getAggregateData()[date];
  const y_step = 33;
  let container = document.getElementById('rank_content');
  const key = this.showDeathCounts_ ? 'deaths' : 'cum_conf';
  let o = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    o[item['code']] = item[key];
  }
  let bars = [...document.getElementsByClassName('bar')];
  bars = bars.sort(function(a, b) {
    const a_code = a.getAttribute('id');
    const b_code = b.getAttribute('id');
    const a_count = o[a_code] || 0;
    const b_count = o[b_code] || 0;
    return a_count < b_count ? 1 : -1;
  });
  let y = 0;
  for (let i = 0; i < bars.length; i++) {
    let b = bars[i];
    const code = b.getAttribute('id');
    if (!o[code]) {
      b.style.display = 'none';
      continue;
    }
    const case_count = o[code];
    b.getElementsByClassName('end')[0].textContent = case_count.toLocaleString();
    b.style.display = 'block';
    b.style.top = y + 'px';
    let base = Math.log10(case_count);
    if (!this.logScale_) {
      base = case_count;
    }
    const displayedWidth = Math.floor(maxWidth * base / this.maxGraphedValue_);
    b.style.width = displayedWidth + 'px';
    y += 37;
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
  }
}
