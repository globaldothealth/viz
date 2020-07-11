/** @abstract */
class View {
  constructor(dataProvider) {};

  /** @abstract @return {string} */ getTitle() { };
  prepareAndRender() {
    if (this.isDataReady()) {
      this.render();
    } else {
      this.fetchData().then(this.render.bind(this));
    }
  };

  /** @abstract @return {boolean} */ isDataReady() {};

  /**
   * Returns the function that should be called to fetch the necessary data.
   * @abstract @return {!Promise}
   */
  fetchData() { };

  render() {
    document.title = this.getTitle();
  };

 /** @abstract */ onThemeChanged(darkTheme) { };
}
