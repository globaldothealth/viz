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
    document.body.classList.add(this.getId());
  };

  isShown() {
    return document.body.classList.contains(this.getId());
  }

  unload() {
    document.body.classList.remove(this.getId());
  }

  /** @abstract */ onThemeChanged(darkTheme) { };
}
