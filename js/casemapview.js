/** @constructor @implements {View} */
let CaseMapView = function(dataProvider, nav) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @const @private {Nav} */
  this.nav_ = new Nav();
};

let rank;
function rankInit() {
  rank = new CaseMapView(new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/'), new Nav());
  rank.init();
}

CaseMapView.prototype.init = function() {
  this.fetchData();
  this.nav_.setupTopBar();
};

CaseMapView.prototype.fetchData = function() {
};

CaseMapView.prototype.render = function() {
};
