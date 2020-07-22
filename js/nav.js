class NavItem {

/**
 * @param {string} name
 * @param {string} id
 * @param {boolean} isToggle
 * @param {boolean=} defaultValue
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

class Nav {

constructor(viz) {
  /** @const @private {Viz} */
  this.viz_ = viz;

  /** @const {!Object.<!NavItem>} */
  this.items_ = {};

  /** @private {!Object.<boolean>} */
  this.config_ = {};

  // Config
  // TODO: Make this work instantly.
  // this.registerNavItem('2D Map', '2d', true, false);
  this.registerNavItem('Auto-drive', 'autodrive', true, false);
  this.registerNavItem('Dark', 'dark', true, false);

  // Views
  this.registerNavItem('Map', 'casemap', false);
  this.registerNavItem('Historical Map', 'historicalmap', false);
  this.registerNavItem('Rank', 'rank', false);
  this.registerNavItem('Synchronized', 'sync', false);
  this.registerNavItem('Completeness', 'completeness', false);
}

/**
 * @param {string} name
 * @param {string} id
 * @param {boolean} isToggle
 * @param {boolean=} defaultValue
 */
registerNavItem(name, id, isToggle, defaultValue) {
  if (isToggle) {
    this.config_[id] = !!defaultValue;
  }
  this.items_[id] = new NavItem(name, id, isToggle, defaultValue);
}

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

toggle(id) {
  this.config_[id] = !!document.getElementById(id).checked;
  this.onConfigChanged(this.config_);
  this.updateHash();
}

/** @param {!Object} config The new config object. */
onConfigChanged(config) {
  let darkRequested = config['dark'];
  document.body.classList.add(darkRequested ? 'dark' : 'light');
  document.body.classList.remove(darkRequested ? 'light' : 'dark');

  this.viz_.onConfigChanged(config);
}

/** @param {string} id */
getConfig(id) {
  return this.config_[id];
}

setConfig(id, value) {
  this.config_[id] = value;
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
        this.setConfig('focus', hashBrown);
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
        this.setConfig(navItem.getId(), true);
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

function makeToggle(toggleId, name, checked) {
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

Nav.prototype.setupTopBar = function() {
  const baseUrl = window.location.origin + '/';
  let topBar = document.getElementById('topbar');
  topBar.innerHTML = '<ul></ul>';

  const navIds = Object.keys(this.items_);
  for (let i = 0; i < navIds.length; i++) {
    const item = this.items_[navIds[i]];
    let itemEl;
    if (item.isToggle()) {
      let checked = item.getDefaultValue();
      // TODO: Get potentially non-default value
      itemEl = makeToggle(item.getId(), item.getName(), checked);
      itemEl.onclick = this.toggle.bind(this, item.getId());
    } else {
      itemEl = document.createElement('li');
      itemEl.setAttribute('id', navIds[i]);
      itemEl.classList.add('navlink');
      itemEl.textContent = item.getName();
      itemEl.onclick = this.navigate.bind(this, item.getId());
    }
    topBar.firstElementChild.appendChild(itemEl);
  }
  this.processHash(window.location.href);
}
