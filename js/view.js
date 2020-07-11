/** @abstract */
class View {
  constructor(dataProvider) {};

  /** @abstract @return {string} */ getTitle() { };
  /** @abstract */ fetchData() { };

  render() {
    document.title = this.getTitle();
  };

 /** @abstract */ onThemeChanged(darkTheme) { };
}
