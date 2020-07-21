class RankView extends View {

constructor(dataProvider, nav) {
  super(dataProvider);

  /** @private @const {Nav} */
  this.nav_ = nav;

  /** @private {number} */
  this.maxGraphedValue_ = 0;

  /** @private {boolean} */
  this.showDeathCounts_ = false;

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

render() {
  super.render();
  this.setEarliestDateIndexWithAggregateData();
  this.currentDateIndex_ = this.minDateIndex_;
  console.log('Rendering ' + this.getId());
  document.getElementById('app').innerHTML = '<h1>Rank</h1><h2>Scroll to advance. Logarithmic scale.</h2><div id="toggle"><div class="active">Cases</div><div>Deaths</div></div><div id="rank_content">Loading...</div><div id="minimap"></div>';
  let container = document.getElementById('rank_content');
  container.innerHTML = '';

  maxWidth = Math.floor(container.clientWidth);

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
    container.appendChild(el);
    i++;
  }

  this.setUpScale();
  this.showRankPageAtCurrentDate();

  let self = this;
  container.onwheel = function(e) {
    self.onRankWheel(e);
  };
  container.ontouchmove = function(e) {
    e.preventDefault();
    self.onRankTouchMove(e['touches'][0].clientY - currentTouchY)
  };
  container.ontouchstart = function(e) {
    e.preventDefault();
    currentTouchY = e['touches'][0].clientY;
  }
  container.ontouchend = function(e) {
    e.preventDefault();
    currentTouchY = -1;
  }

  let toggle = document.getElementById('toggle');
  // Assume only two modes here.
  toggle.firstChild.onclick = this.onToggleClicked.bind(this);
  toggle.lastChild.onclick = this.onToggleClicked.bind(this);
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
  this.maxGraphedValue_ = Math.log10(maxValue);
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
  let toggle = document.getElementById('toggle');
  if (toggle.firstChild == e.target) {
    toggle.firstChild.classList.add('active');
    toggle.lastChild.classList.remove('active');
    this.showDeathCounts_ = false;
  } else if (toggle.lastChild == e.target) {
    toggle.firstChild.classList.remove('active');
    toggle.lastChild.classList.add('active');
    this.showDeathCounts_ = true;
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
  let newDateIndex = this.currentDateIndex_ + (forward ? steps : -steps);
  newDateIndex = Math.max(newDateIndex, this.minDateIndex_);
  newDateIndex = Math.min(newDateIndex,
                          this.dataProvider_.getDates().length -1);
  this.currentDateIndex_ = newDateIndex;
  this.showRankPageAtCurrentDate();
  let self = this;
  if (this.nav_.getConfig('autodrive')) {
    window.setTimeout(function() {
      self.rankAdvance.bind(self)(true, 1);
    }, 200);
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
    const displayedWidth = Math.floor(
        maxWidth * Math.log10(case_count) / this.maxGraphedValue_);
    b.style.width = displayedWidth + 'px';
    y += 37;
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
  }
}
