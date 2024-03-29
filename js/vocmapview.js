class VocMapView extends View {

    /**
     * @param {DataProvider} dataProvider
     * @param {Nav} nav
     */
    constructor(dataProvider, nav) {
      super(dataProvider, nav);
    }
    
    getId() {
      return 'variant-reporting';
    }
    
    getTitle() {
      return 'Variant Reporting';
    }    

    render() {
        super.render();
        let app = document.getElementById('app');
        app.innerHTML = '';        
      
        let reactAppEl = document.getElementById('voc-map-container');
        reactAppEl.classList.remove('hidden');        
                    
        this.renderLogo();
      }

    unload() {
        super.unload();

        let reactAppEl = document.getElementById('voc-map-container');
        reactAppEl.classList.add('hidden');        
    }
    
}  // VocMapView
    