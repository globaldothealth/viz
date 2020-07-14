/** @abstract */
class View {
  constructor(dataProvider) {};

  /** @abstract @return {string} */ getId() { };

  /** @abstract @return {string} */ getTitle() { };
  prepareAndRender() {
    console.log('Fetching data for ' + this.getId());
    this.fetchData().then(this.render.bind(this));
  };

  /**
   * Returns the function that should be called to fetch the necessary data.
   * @abstract @return {!Promise}
   */
  fetchData() { };

  render() {
    document.title = this.getTitle();
    document.body.className = this.getId();
  };

  isShown() {
    return document.body.className == this.getId();
  }

 /** @abstract */ onThemeChanged(darkTheme) { };
}
