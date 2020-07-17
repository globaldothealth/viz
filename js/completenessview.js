let completeness;

class CompletenessView extends View {
constructor(dataProvider) {
  super(dataProvider);
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;
}

getId() {
  return 'completeness';
}

getTitle() {
  return 'Completeness';
};

fetchData() {
  let self = this;
  return this.dataProvider_.fetchInitialData().then(
    // We only need the latest daily slice for the data completeness page.
    self.dataProvider_.fetchLatestDailySlice.bind(self.dataProvider_));
}

render() {
  super.render();
  const latestCountryFeatures = this.dataProvider_.getCountryFeaturesForDay(
      this.dataProvider_.getLatestDate());

  const aggregates = {};
  const totalsFromIndividuals = {};

  const latestDataPerCountry = this.dataProvider_.getLatestDataPerCountry();
  for (let c in latestDataPerCountry) {
    aggregates[c] = latestDataPerCountry[c][0];
  }

  for (let c in latestCountryFeatures) {
    const data = latestCountryFeatures[c];
    totalsFromIndividuals[c] = data['total'];
  }

  let comparisons = [];
  const ratioPrecision = 1;
  for (let c in aggregates) {
      comparisons.push([c, totalsFromIndividuals[c] || 0, aggregates[c]]);
  }
  // Sort by completeness level.
  comparisons.sort(function(a, b) {
    const ratio_a = 100 * a[1] / a[2];
    const ratio_b = 100 * b[1] / b[2];
    const ratio_a_str = ratio_a.toFixed(ratioPrecision);
    const ratio_b_str = ratio_b.toFixed(ratioPrecision);
    if (ratio_a_str == ratio_b_str) {
      // If the ratios are the same, order by the number of missing cases.
      const missing_a = a[2] - a[1];
      const missing_b = b[2] - b[1];
      return (missing_a <= missing_b) ? 1 : -1;
    }
    return (ratio_a > ratio_b) ? 1 : -1;
  });
  let container = document.getElementById('app');
  container.innerHTML = '';
  let list = document.createElement('table');
  list.innerHTML = '<tr><th>Country</th><th>Completion</th><th>"Line list" vs JHU aggregate</th></tr>';
  let totalIndividual = 0;
  let totalAggregate = 0;
  for (let i = 0; i < comparisons.length; i++) {
    const code = comparisons[i][0];
    const name = this.dataProvider_.getCountry(code).getName();
    const individual = comparisons[i][1];
    const aggregate = comparisons[i][2];
    totalIndividual += individual;
    totalAggregate += aggregate;
    const percentage = (100 * individual / aggregate).toFixed(ratioPrecision);
    let row = document.createElement('tr');
    row.innerHTML = '<td>' + name + '</td><td><b>' + percentage + '%</b>' +
          '</td><td>' + individual + ' vs ' + aggregate + '</td>';
    list.appendChild(row);
  }
 const globalPercentage = (100 * totalIndividual / totalAggregate).
      toFixed(ratioPrecision);
  container.innerHTML = '<h2>Global completeness: ' + globalPercentage + '%</h2>';
  container.appendChild(list);
}

}

CompletenessView.prototype.onConfigChanged = function(config) { };
