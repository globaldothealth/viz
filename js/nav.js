/**
 * Represents a single item in the navigation bar, either a toggle (a boolean
 * preference) or a destination view.
 */
class NavItem {

/**
 * @param {string} name
 * @param {string} id
 * @param {boolean} isToggle Whether this is a boolean preference.
 * @param {boolean=} defaultValue The default value for the boolean preference,
 *     if applicable.
 */
constructor(name, id, isToggle, defaultValue) {

  /** @private @const {string} */
  this.name_ = name;

  /** @private @const {string} */
  this.id_ = id;

  /** @private @const {boolean} */
  this.isToggle_ = isToggle;

  /** @private @const {boolean} */
  this.defaultValue_ = !!defaultValue;
}

getName() { return this.name_; }

getId() { return this.id_; }

isToggle() { return this.isToggle_; }

getDefaultValue() { return this.defaultValue_; }

} // NavItem

/**
 * The navigation bar. Handles navigation between views as well as configuration
 * changes.
 */
class Nav {

constructor(viz) {
  /** @const @private {Viz} */
  this.viz_ = viz;

  /** @const {!Object.<!NavItem>} */
  this.items_ = {};

  /** @private {!Object.<boolean|string>} */
  this.config_ = {};

  // Config
  // TODO: Make this work instantly.
  // this.registerToggle('2D Map', '2d', false);
  this.registerToggle('Auto-drive', 'autodrive', false);
  this.registerToggle('Dark', 'dark', false);
  this.registerToggle('Fullscreen', 'fullscreen', false);

  // Views are registered in main.js
}

/**
 * @param {string} name
 * @param {string} id
 * @param {boolean} defaultValue
 */
registerToggle(name, id, defaultValue) {
  this.config_[id] = !!defaultValue;
  this.items_[id] = new NavItem(name, id, true, defaultValue);
}

/**
 * @param {string} name
 * @param {string} id
 */
registerNavItem(name, id) {
  this.items_[id] = new NavItem(name, id, false, undefined);
}

/**
 * Navigates to and loads the view with the given id.
 * @param {string} id
 */
navigate(id) {
  this.viz_.loadView(id);
  const navIds = Object.keys(this.items_);
  for (let i = 0; i < navIds.length; i++) {
    const item = this.items_[navIds[i]];
    if (!item.isToggle()) {
      const el = document.getElementById(item.getId());
      if (item.getId() == id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }
  this.updateHash();
}

/** Toggles the boolean pref with the given ID. */
toggle(id) {
  this.config_[id] = !!document.getElementById(id).checked;
  this.onConfigChanged(this.config_);
  this.updateHash();
}

/** @param {!Object} config The new config object. */
onConfigChanged(config) {
  this.updateHash();
  this.updateToggles();
  this.viz_.onConfigChanged(config);
}

/**
 * @param {string} id
 * @return {boolean|string} The value of the preference with the given ID.
 */
getConfig(id) {
  return this.config_[id];
}

/**
 * @param {string} id
 * @param {boolean|string} value
 */
setConfig(id, value) {
  this.config_[id] = value;
  this.onConfigChanged(this.config_);
}

/** Updates the toggle views to reflect the current config values. */
updateToggles() {
  let keys = Object.keys(this.config_);
  for (let i = 0; i < keys.length; i++) {
    let el = document.getElementById(keys[i]);
    if (!!el) {
      el.checked = this.config_[keys[i]];
    }
  }
}

} // Nav

/**
 * Deserializes the state from the URL. This should only be called at the
 * start of a session.
 */
Nav.prototype.processHash = function(newUrl) {
  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  const newHashes = newUrl.substring(baseUrl.length).split('/');
  let darkTheme = false;
  let viewToLoad = 'casemap';
  if (newHashes.length > 0) {
    for (let i = 0; i < newHashes.length; i++) {
      let hashBrown = newHashes[i];
      if (hashBrown.startsWith('#')) {
        hashBrown = hashBrown.substring(1);
      }

      // Handle a country code.
      if (hashBrown.length == 2 && hashBrown.toUpperCase() == hashBrown) {
        this.config_['focus'] = hashBrown;
        continue;
      }

      hashBrown = hashBrown.toLowerCase();
      let navItem = this.items_[hashBrown];
      if (!navItem) {
        // We don't recognize this.
        continue;
      }

      if (navItem.isToggle()) {
        document.getElementById(navItem.getId()).checked = true;
        this.config_[navItem.getId()] = true;
        continue;
      } else {
        // This is a view. If several views are specified, last one wins.
        viewToLoad = hashBrown;
        continue;
      }
    }
  }

  // Do as if the config had been changed so that the first setup happens.
  this.onConfigChanged(this.config_);
  this.navigate(viewToLoad);
}

/** Serializes the state into the URL so that it can be shared or reloaded. */
Nav.prototype.updateHash = function() {
  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  let hashes = [this.viz_.getCurrentViewId()];
  const navIds = Object.keys(this.items_);
  let configKeys = Object.keys(this.config_);
  for (let i = 0; i < configKeys.length; i++) {
    const key = configKeys[i];
    if (key == 'focus') {
      hashes.push(this.config_[key]);
    } else {
      // Assume that a "true" value means it is non-default.
      if (this.config_[key]) {
        hashes.push(key);
      }
    }
  }
  window.location.href = baseUrl + '#' + hashes.join('/');
}

/**
 * @param {string} toggleId The unique ID for this toggle.
 * @param {string} name The displayed name for this toggle.
 * @param {boolean} checked Whether the toggle is initially checked.
 * @return {!Element} The rendered toggle element to add to the DOM.
 */
Nav.prototype.makeToggle = function(toggleId, name, checked) {
  let container = document.createElement('div');
  container.classList.add('toggle');
  let labelEl = document.createElement('label');
  labelEl.classList.add('switch');
  labelEl.innerHTML = '<input type="checkbox" id="' + toggleId + '"' +
        (checked ? ' checked' : '') + '><span class="slider"></span>'
  container.appendChild(labelEl);
  let nameEl = document.createElement('span');
  nameEl.classList.add('switch-name');
  nameEl.textContent = name;
  container.appendChild(nameEl);
  return container;
}

/** Initializes and renders the navigation bar. */
Nav.prototype.setupTopBar = function() {
  const baseUrl = window.location.origin + '/';
  let topBar = document.getElementById('topbar');

  const navIds = Object.keys(this.items_);
  for (let i = 0; i < navIds.length; i++) {
    const item = this.items_[navIds[i]];
    let itemEl;
    if (item.isToggle()) {
      let checked = item.getDefaultValue();
      // TODO: Get potentially non-default value
      itemEl = this.makeToggle(item.getId(), item.getName(), checked);
      itemEl.onclick = this.toggle.bind(this, item.getId());
    } else {
      itemEl = document.createElement('div');
      itemEl.setAttribute('id', navIds[i]);
      itemEl.classList.add('navlink');
      itemEl.textContent = item.getName();
      itemEl.onclick = this.navigate.bind(this, item.getId());
    }
    topBar.appendChild(itemEl);
  }
  this.processHash(window.location.href);
}
