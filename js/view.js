/**
 * The base class for all views. A view is responsible for fetching the data it
 * needs before being rendered, and for rendering itself.
 * @abstract
 */

const renderHelpGuide = () =>  {
  let  helpGuide = document.createElement('div');
  helpGuide.setAttribute('id', 'helpGuide');
  helpGuide.innerHTML = '<button class="help-guide-button MuiButton-textPrimary"><svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg><span class="map-guide-text">Map Guide</span></button>';
  helpGuide.classList.add('navlink');
  helpGuide.classList.add('navlink-question-mark');

  document.getElementById('logo').appendChild(helpGuide);

  const helpGuideModal ='<div id="modalcontent"><h1>Welcome to Global.health Map!</h1> \
                                            <p>These geospatial data visualisations allow you to explore our COVID-19 line-list dataset through a few different views:</p> \
                                            <p><strong>Country View:</strong> Click on a country to see available line-list data in that country, and click through to see corresponding filtered results on G.h Data. You can also use the left-hand navigation to search or select a country, and view available data for Variants of Concern using the filters. Darker colours indicate more available data. (Please note: not all Variant of Concern data are downloadable. Please see our <a href="https://github.com/globaldothealth/list/issues/url" title="FAQs">FAQs</a> and <a href="https://global.health/ackowledgement/" title="Data Acknowledgments">Data Acknowledgments</a> for more info.)</p> \
                                            <p><strong>Regional View:</strong> Click on extrusion to see available line-list data in that region, and click through to see corresponding filtered results on G.h Data. Taller extrusions indicate more available data. Records that do not include regional metadata are labeled as "Country, Country" (e.g. "India, India"). Please see our <a href="https://github.com/globaldothealth/list/issues/url" title="FAQs">FAQs</a> for more info.</p> \
                                            <p><strong>Coverage Map:</strong> This view illustrates available line-list COVID-19 case data in the Global.health database in a given country as a percentage of total cumulative case data as indicated by the <a href="https://coronavirus.jhu.edu/map.html" title="Johns Hopkins University COVID Resource Center" target="blank" rel="noopener noreferrer">Johns Hopkins University COVID Resource Center</a>. Darker colours indicate more available line-list data. Totals are updated daily.</p></div> \
                                            ';

 helpGuide.addEventListener('click', (e) => handleShowModal(helpGuideModal, e))
  }


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
    logoEl.innerHTML = '<a href="https://global.health/"><div id="logo-container"> \
    <img src="/img/gh_logo.svg" /> \
    <span>Map</span> \
    </div></a> \
    ';
    document.getElementById('app').appendChild(logoEl);
    renderHelpGuide();
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
