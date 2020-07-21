/** @abstract */
class View {
  constructor(dataProvider) {
    /** @protected @const {DataProvider} */
    this.dataProvider_ = dataProvider;
  }

  /** @abstract @return {string} */ getId() { }

  /** @abstract @return {string} */ getTitle() { }

  prepareAndRender() {
    console.log('Fetching data for ' + this.getId());
    this.fetchData().then(this.render.bind(this));
  }

  /**
   * Returns a promise to fetch the necessary data. Subclasses can build
   * upon it to chain promises.
   * @return {!Promise}
   */
  fetchData() {
    return this.dataProvider_.fetchInitialData();
  }

  render() {
    document.title = this.getTitle();
    document.body.classList.add(this.getId());
  }

  isShown() {
    return document.body.classList.contains(this.getId());
  }

  unload() {
    document.body.classList.remove(this.getId());
  }

  /** @abstract */ onConfigChanged(config) { };
}
