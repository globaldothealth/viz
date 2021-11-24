let viz = null;

function bootstrap() {
  viz = new Viz();
  viz.init();
}

class Viz {
  constructor() {
    /**
     * This will be replaced at run time or deploy time.
     * @const @private {DataProvider}
     */
    this.dataProvider_ = new DataProvider("{{DATA_SRC_URL}}");

    /** @private @const {!Object.<!View>} */
    this.views_ = {};

    /** @const @private {Nav} */
    this.nav_ = new Nav(this);

    /** @private {string} */
    this.currentViewId_ = "";
  }

  onKeyDown(event) {
    event = event || window.event;
    if (event.code.toLowerCase() == "escape") {
      this.nav_.setConfig("fullscreen", false);
    }
  }
}

/** @const */
Viz.LIVE_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Globals
let locationInfo = {};

let currentIsoDate;
let currentDateIndex = 0;
let currentTouchY = -1;

/** @return {string} */
Viz.prototype.getCurrentViewId = function () {
  return this.currentViewId_;
};




function handleShowModal(html, e) {
  e.preventDefault();
  let modal = document.getElementById("modal");
  let modalWrapper = document.getElementById("modal-wrapper");

  // Switch elements to have 'display' value (block, flex) but keep hidden via
  // opacity
  modalWrapper.classList.add("is-block");
  modal.classList.add("is-flex");
  setTimeout(function () {
    // for transition
    modalWrapper.classList.add("is-visible");
    modal.classList.add("is-visible");
  }, 40);
  modal.innerHTML = '<span id="modal-cancel">&#10005;</span>' + html;

  // Attach an event to the close button once this is finished rendering.
  setTimeout(function () {
    document.getElementById("modal-cancel").onclick = handleHideModal;
    document.querySelector(".modal-backdrop").onclick = handleHideModal;
  }, 0);

  makeDivDraggable(modal);
}

function handleHideModal() {
  let modal = document.getElementById("modal");
  let modalWrapper = document.getElementById("modal-wrapper");
  modalWrapper.classList.remove("is-visible");
  modal.classList.remove("is-visible");
  setTimeout(function () {
    // for transition
    modalWrapper.classList.remove("is-block");
    modal.classList.add("is-flex");
  }, 400);
}

function makeDivDraggable(modal, e) {
  e = e || window.event;
  let x = 0;
  let y = 0;
  
  // Query the element
  const ele = modal;
  ele.style.cursor = "move";
  
  // Handle the mousedown event
  // that's triggered when user drags the element
  const mouseDownHandler = function(e) {
      // Get the current mouse position
      x = e.clientX;
      y = e.clientY;
      
      // Attach the listeners to `document`
      if (e.target.tagName.toLowerCase() !== 'a') {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      }
  };
  
  const mouseMoveHandler = function(e) {
      // How far the mouse has been moved
      const dx = e.clientX - x;
      const dy = e.clientY - y;
  
      // Set the position of element
      ele.style.top = `${ele.offsetTop + dy}px`; 
      ele.style.left = `${ele.offsetLeft + dx}px`;
  
      // Reassign the position of mouse
      x = e.clientX;
      y = e.clientY;
  };
  
  const mouseUpHandler = function() {
      // Remove the handlers of `mousemove` and `mouseup`
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
  };
  
  e.which === 1 ?  ele.addEventListener('mousedown', mouseDownHandler)  : null;

};



Viz.prototype.init = function () {
  this.registerView(new AggregateMapView(this.dataProvider_, this.nav_));
  this.registerView(new AggregateMapViewP1(this.dataProvider_, this.nav_));
  this.registerView(new AggregateMapViewB1351(this.dataProvider_, this.nav_));
  this.registerView(new CaseMapView(this.dataProvider_, this.nav_));
  // this.registerView(new FreshnessMapView(this.dataProvider_, this.nav_));
  // this.registerView(new HistoricalMapView(this.dataProvider_, this.nav_));
  this.registerView(new TwoDCoverageMapView(this.dataProvider_, this.nav_));
  // this.registerView(new VocMapView(this.dataProvider_, this.nav_));
  // this.registerView(new RankView(this.dataProvider_, this.nav_));
  // this.registerView(new SyncView(this.dataProvider_));

  this.nav_.setupTopBar();

  let self = this;
  window.onhashchange = function (h) {
    console.log("Hash change " + h.newURL);
  };

  document.onkeydown = this.onKeyDown.bind(this);
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
};

/** @param {!View} view */
Viz.prototype.registerView = function (view) {
  this.views_[view.getId()] = view;
  this.nav_.registerNavItem(view.getTitle(), view.getId());
};

Viz.prototype.updateData = function () {
  console.log("Updating data...");
  this.dataProvider_
    .fetchLatestCounts(true /* forceRefresh */)
    .then(function () {
      console.log("Updated latest counts.");
    });
  this.dataProvider_.fetchDataIndex().then(function () {
    console.log("Updated data index.");
  });

  // Update the data again after another time interval.
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
};

Viz.prototype.loadView = function (viewId) {
  if (this.currentViewId_ == viewId) {
    // Nothing to do.
    console.log("Same view requested again, aborting.");
    return;
  }
  if (this.views_.hasOwnProperty(viewId)) {
    if (!!this.currentViewId_) {
      this.views_[this.currentViewId_].unload();
    }
    this.currentViewId_ = viewId;
    this.views_[viewId].prepareAndRender();
  }
};

Viz.prototype.onConfigChanged = function (config) {
  let views = Object.values(this.views_);
  for (let i = 0; i < views.length; i++) {
    views[i].onConfigChanged(config);
  }
  let darkRequested = config["dark"];
  document.body.classList.add(darkRequested ? "dark" : "light");
  document.body.classList.remove(darkRequested ? "light" : "dark");

  const isFullScreen = !!config["fullscreen"];
  document.body.classList.toggle("fullscreen", isFullScreen);
  if (isFullScreen) {
    document.getElementById("settings-menu").style.display = "none";
  }
};

const hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));

// Exports
if (typeof globalThis === "undefined" && typeof global !== "undefined") {
  globalThis = global;
}
globalThis["bootstrap"] = bootstrap;
