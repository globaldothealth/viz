/** @constructor */
let Rank = function(dataProvider) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;
};

Rank.CONTINENT_COLORS = {
  'O': '#b600ff',  // purple
  'S': '#0c1fb4',  // dark blue
  'N': '#0060ff',  // blue
  'E': '#00b31a',  // green
  'A': '#bb9900',  // yellow
  'P': '#e37300',  // orange
  'Z': '#e90000',  // red
};

let maxGraphedValue = 0;
let maxWidth = 0;
let showDeathCounts = false;

let rank;
function rankInit() {
  rank = new Rank(new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/'));
  rank.init();
}

Rank.prototype.init = function() {
  const dp = this.dataProvider_;
  let self = this;
  dp.fetchCountryNames().
      then(dp.fetchJhuData.bind(dp)).
      then(self.showRankPage);
  setupTopBar();
};

function onToggleClicked(e) {
  let toggle = document.getElementById('toggle');
  if (toggle.firstChild == e.target) {
    toggle.firstChild.classList.add('active');
    toggle.lastChild.classList.remove('active');
    showDeathCounts = false;
  } else if (toggle.lastChild == e.target) {
    toggle.firstChild.classList.remove('active');
    toggle.lastChild.classList.add('active');
    showDeathCounts = true;
  }
  onModeToggled();
}

function onModeToggled() {
  const aggregates = dataProvider.getAggregateData();
  const key = showDeathCounts ? 'deaths' : 'cum_conf';
  let maxValue = 0;
  dates = Object.keys(aggregates).sort();

  for (let date in aggregates) {
    for (let country in aggregates[date]) {
      maxValue = Math.max(maxValue, aggregates[date][country][key]);
    }
  }
  maxGraphedValue = Math.log10(maxValue);
  showRankPageAtCurrentDate();
}

Rank.prototype.showRankPage = function() {
  let container = document.getElementById('data');
  container.innerHTML = '';
  maxWidth = Math.floor(container.clientWidth);

  let i = 0;
  let countries = this.dataProvider_.getCountries();
  for (let code in countries) {
    const c = countries[code];
    let el = document.createElement('div');
    el.setAttribute('id', code);
    el.classList.add('bar');
    const color = Rank.CONTINENT_COLORS[c.getContinent()];
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

  onModeToggled();
  container.onwheel = function(e) {
    onRankWheel(e)
  };
  container.ontouchmove = function(e) {
    e.preventDefault();
    onRankTouchMove(e['touches'][0].clientY - currentTouchY)
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
  toggle.firstChild.onclick = onToggleClicked;
  toggle.lastChild.onclick = onToggleClicked;
}

function onRankTouchMove(delta) {
  const points_per_step = 150;
  rankAdvance(delta > 0, Math.floor(Math.abs(delta / points_per_step)));
}

function onRankWheel(e) {
  e.preventDefault();
  rankAdvance(e.deltaY > 0, 1);
}

function rankAdvance(forward, steps) {
  let newDateIndex = currentDateIndex + (forward ? steps : -steps);
  newDateIndex = Math.max(newDateIndex, 0);
  newDateIndex = Math.min(newDateIndex, dates.length -1);
  currentDateIndex = newDateIndex;
  showRankPageAtCurrentDate();
}

function showRankPageAtCurrentDate() {
  const date = dates[currentDateIndex];
  document.getElementById('title').textContent = date;
  const data = dataProvider.getAggregateData()[date];
  const y_step = 33;
  let container = document.getElementById('data');
  const key = showDeathCounts ? 'deaths' : 'cum_conf';
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
    b.style.width = Math.floor(
        maxWidth * Math.log10(case_count) / maxGraphedValue);
    y += 37;
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
  }
}

globalThis['rankInit'] = rankInit;
