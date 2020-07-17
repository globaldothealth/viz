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
  this.registerNavItem('2D Map', '2d', true, false);
  this.registerNavItem('Auto-drive', 'autodrive', true, false);
  this.registerNavItem('Dark', 'dark', true, false);

  // Views
  this.registerNavItem('Case Map', 'casemap', false);
  this.registerNavItem('Rank', 'rank', false);
  this.registerNavItem('Sync', 'sync', false);
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
  console.log('Navigating to ' + id);
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
}

toggle(id) {
  console.log('Toggling ' + id);
  this.config_[id] = !!document.getElementById(id).checked;
  this.onConfigChanged(this.config_);
}

/** @param {!Object} config The new config object. */
onConfigChanged(config) {
  let darkRequested = config['dark'];
  document.body.classList.add(darkRequested ? 'dark' : 'light');
  document.body.classList.remove(darkRequested ? 'light' : 'dark');

  this.viz_.onConfigChanged(config);
}


getConfig(id) {
  return this.config_[id];
}

} // Nav

Nav.prototype.processHash = function(oldUrl, newUrl) {
  console.log('Old URL is ' + oldUrl);
  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  const oldHashes = !!oldUrl ? oldUrl.substring(baseUrl.length).split('/') : [];
  const newHashes = newUrl.substring(baseUrl.length).split('/');
  let darkTheme = false;
  let viewToLoad = 'casemap';
  if (newHashes.length > 0 || oldHashes.length > 0) {
    for (let i = 0; i < newHashes.length; i++) {
      let hashBrown = newHashes[i];
      if (hashBrown.startsWith('#')) {
        hashBrown = hashBrown.substring(1);
      }

      // Handle a country code.
      if (hashBrown.length == 2 && hashBrown.toUpperCase() == hashBrown) {
        initialFlyTo = hashBrown;
        continue;
      }

      hashBrown = hashBrown.toLowerCase();
      let navItem = this.items_[hashBrown];
      if (!navItem) {
        // We don't recognize this.
        continue;
      }

      if (navItem.isToggle()) {
        if (hashBrown == '2d') {
          twoDMode = true;
          continue;
        }
        if (hashBrown == 'autodrive') {
          autoDriveMode = true;
          document.body.classList.add('autodrive');
          continue;
        }

        if (hashBrown == 'dark') {
          darkTheme = true;
          continue;
        }

        // TODO
      } else {
        // This is a view. If several views are specified, last one wins.
        viewToLoad = hashBrown;
        continue;
      }
    }
  }

  // If this is our first load (oldURL is empty), do as if the config had been
  // changed so that the first setup happens.
  if (!oldUrl) {
    this.onConfigChanged(this.config_);
  }
  this.navigate(viewToLoad);
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
      itemEl.textContent = item.getName();
      itemEl.onclick = this.navigate.bind(this, item.getId());
    }
    topBar.firstElementChild.appendChild(itemEl);
  }
  this.processHash('', window.location.href);
}
