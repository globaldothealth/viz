class SyncView extends View {

constructor(dataProvider) {
  super(dataProvider);

  /** @private {Array.<string>} */
  this.countriesSortedByAffectedness_ = [];

  /** @private {Array.<string>} */
  this.countriesSortedByPopulation_ = [];
}

getId() {
  return 'sync';
}

getTitle() {
  return 'Synchronized';
};

renderGraph(container, labels, dataToPlot) {
  let canvas = document.getElementById('sync-graph');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'sync-graph');
  }
  canvas.innerHTML = '';
  canvas.setAttribute('width', container.clientWidth + 'px');
  canvas.setAttribute('height', Math.floor(0.8 * container.clientHeight) + 'px');
  container.appendChild(canvas);
  let ctx = canvas.getContext('2d');
  let cfg = Graphing.CHART_CONFIG;
  cfg['options']['tooltips']['mode'] = 'nearest';
  cfg['options']['tooltips']['callbacks'] = {'label': function(item, data) {
    return data['datasets'][item['datasetIndex']]['label'] + ': ' + item['yLabel'] + ' %';
  }};
  cfg['options']['scales']['xAxes'][0]['type'] = undefined;
  cfg['options']['scales']['xAxes'][0]['time'] = {};
  if (!cfg['options']['scales']['yAxes'][0]['ticks']) {
    cfg['options']['scales']['yAxes'][0]['ticks'] = {};
  }

  cfg['data'] = {
    'labels': labels,
    'datasets': dataToPlot,
  }

  new Chart(ctx, cfg);
}

prepareGraphData() {
  if (!this.countriesSortedByPopulation_.length) {
    this.cacheCountriesSortedByPopulation();
  }

  const aggregates = this.dataProvider_.getAggregateData();
  let dates = Object.keys(aggregates);
  // Sort in chronological order.
  dates = dates.sort();
  let o = {'dates': dates};
  let curveStart = {};
  let curves = {};
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    let items = aggregates[date];
    for (let j = 0; j < items.length; j++) {
      const code = items[j]['code'];
      const cases = items[j]['cum_conf']
      if (!curveStart[code] && cases >= STARTING_CASE_COUNT) {
        curveStart[code] = date;
      }
      if (!!curveStart[code]) {
        if (!curves[code]) {
          curves[code] = [];
        }
        curves[code].push([date, cases]);
      }
    }
  }

  let maxDays = 0;
  for (let code in curves) {
    maxDays = Math.max(maxDays, curves[code].length);
  }

  let labels = [];
  let dataToPlot = [];
  for (let i = 0; i < maxDays; i++) {
    labels.push('D + ' + i);
  }
  let i = 0;
  let maxValue = 0;
  let latestPercentageByCountry = {};
  for (let code in curves) {
    const country = this.dataProvider_.getCountry(code);
    if (!country) {
      continue;
    }
    const name = country.getName();
    const population = country.getPopulation();
    if (!population) {
      continue;
    }
    let thisData = [];
      for (let j = 0; j < curves[code].length; j++) {
        const caseCount = curves[code][j][1];
        const percentage = (caseCount / population * 100).toFixed(3);
        if (j == curves[code].length - 1) {
          latestPercentageByCountry[code] = percentage;
        }
        maxValue = Math.max(maxValue, percentage);
        thisData.push(percentage);
    }
    const color = Graphing.CURVE_COLORS[i % Graphing.CURVE_COLORS.length];
    dataToPlot.push({
      'data': thisData, 'label': name, 'borderColor': color,
      'code': country.getCode(),
      'backgroundColor': 'transparent'});
    i++;
  }

  let countriesSortedByAffectedness = Object.keys(latestPercentageByCountry);
  countriesSortedByAffectedness.sort(function(a, b) {
    return latestPercentageByCountry[b] - latestPercentageByCountry[a];
  });

  this.countriesSortedByAffectedness_ = countriesSortedByAffectedness;

  return [labels, dataToPlot];
}

filterGraphData(labelsAndData) {
  const filterCount = parseInt(
    document.getElementById('rank-filter-count').value, 10);
  const filterSelect = document.getElementById('rank-filter-select').value;
  console.log(filterCount);
  console.log(filterSelect);
  let filteredCurves = [];
  if (filterSelect == 'populous') {
    let selectedCountries = [];
    for (let i = 0; i < filterCount; i++) {
      selectedCountries.push(this.countriesSortedByPopulation_[i]);
    }
    for (let i = 0; i < labelsAndData[1].length; i++) {
      if (selectedCountries.includes(labelsAndData[1][i]['code'])) {
        filteredCurves.push(labelsAndData[1][i]);
      }
    }
  } else {
    // 'affected'
    let selectedCountries = [];
    for (let i = 0; i < filterCount; i++) {
      selectedCountries.push(this.countriesSortedByAffectedness_[i]);
    }
    for (let i = 0; i < labelsAndData[1].length; i++) {
      if (selectedCountries.includes(labelsAndData[1][i]['code'])) {
        filteredCurves.push(labelsAndData[1][i]);
      }
    }
  }
  console.log(filteredCurves);
  return [labelsAndData[0], filteredCurves];
}

renderFilters() {
  let container = document.getElementById('filters');
  container.innerHTML = 'Only show the ' +
    '<input id="rank-filter-count" size="3" value="10" /> most ' +
    '<select id="rank-filter-select"><option selected>affected</option>' +
    '<option>populous</option></select> ' +
    'countries';
  document.getElementById('rank-filter-count').onchange = this.updateGraph.bind(this);
  document.getElementById('rank-filter-select').onchange = this.updateGraph.bind(this);
}

cacheCountriesSortedByPopulation() {
  let countries = this.dataProvider_.getCountries();
  let codes = Object.keys(countries);
  codes.sort(function(code_a, code_b) {
    let a = countries[code_a];
    let b = countries[code_b];
    const pop_a = a.getPopulation();
    const pop_b = b.getPopulation();
    return pop_b - pop_a;
  });
  this.countriesSortedByPopulation_ = codes;
}

updateGraph() {
  console.log('Updating graph');
  const graphData = this.filterGraphData(this.prepareGraphData());
  this.renderGraph(document.getElementById('app'), graphData[0], graphData[1]);
}

render() {
  super.render();

  let container = document.getElementById('app');
  container.innerHTML = '<h2>Confirmed cases in % of population. D = day of the ' +
      STARTING_CASE_COUNT.toLocaleString() + '<sup>th</sup> case</h2><div id="filters"></div>';
  this.renderFilters();
  this.updateGraph();
}

onConfigChanged(config) { };

} // SyncView

const STARTING_CASE_COUNT = 10000;
