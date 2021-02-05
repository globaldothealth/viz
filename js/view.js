/**
 * The base class for all views. A view is responsible for fetching the data it
 * needs before being rendered, and for rendering itself.
 * @abstract
 */
class View {
  constructor(dataProvider) {
    /** @protected @const {DataProvider} */
    this.dataProvider_ = dataProvider;
  }

  /**
   * @abstract
   * @return {string} The view's unique ID, which will be used in things like
   *     class names, URL hashes, etc.
   */
  getId() { }

  /**
   * @abstract
   * @return {string} The view's title, which will be used for the document
   *     head's title, link anchor, etc.
   */
  getTitle() { }

  /** Fetches the necessary data and renders this view. */
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

  /** Renders the view to the DOM. */
  render() {
    document.title = 'Global.health | a Data Science Initiative';
    // document.title = this.getTitle() + ' | {{TITLE}}';
    console.log('Rendering "' + document.title + '"');
    document.body.classList.add(this.getId());
  }

  renderLogo() {
    let logoEl = document.createElement('div');
    logoEl.classList.add('logo');
    logoEl.setAttribute('id', 'logo');
    logoEl.innerHTML = '<a href="https://test-globalhealth.pantheonsite.io/"><img src="/img/gh_logo.svg" /><span>Map</span></a>';
    document.getElementById('app').appendChild(logoEl);
  }

  /** @return {boolean} Whether this view is currently shown. */
  isShown() {
    return document.body.classList.contains(this.getId());
  }

  /** Called when this view is unloaded and before another view renders. */
  unload() {
    document.body.classList.remove(this.getId());
  }

  /** @abstract  Called when something changes in the configuration. */
  onConfigChanged(config) { };

}
