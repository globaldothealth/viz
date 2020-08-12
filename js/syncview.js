class SyncView extends View {

constructor(dataProvider) {
  super(dataProvider);
}

getId() {
  return 'sync';
}

getTitle() {
  return 'Synchronized';
};

renderGraph(container, labels, dataToPlot) {
  let canvas = document.createElement('canvas');
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
        maxValue = Math.max(maxValue, percentage);
        thisData.push(percentage);
    }
    const color = Graphing.CURVE_COLORS[i % Graphing.CURVE_COLORS.length];
    dataToPlot.push({
      'data': thisData, 'label': name, 'borderColor': color,
      'backgroundColor': 'transparent'});
    i++;
  }
  return [labels, dataToPlot];
}

filterGraphData(data) {
  return data;
}

renderFilters() {
  let container = document.getElementById('filters');
  container.innerHTML = 'Only show the <input size="3" value="10" /> most ' +
    '<select><option selected>affected</option>' +
    '<option>populous</option></select> ' +
    'countries';
}

render() {
  super.render();

  let container = document.getElementById('app');
  container.innerHTML = '<h2>Confirmed cases in % of population. D = day of the ' +
      STARTING_CASE_COUNT.toLocaleString() + '<sup>th</sup> case</h2><div id="filters"></div>';
  this.renderFilters();
  const graphData = this.filterGraphData(this.prepareGraphData());
  this.renderGraph(container, graphData[0], graphData[1]);
}

onConfigChanged(config) { };

} // SyncView

const STARTING_CASE_COUNT = 10000;
