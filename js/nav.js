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

  /** @private {boolean} */
  this.darkTheme_ = false;

  this.registerNavItem('2D Map', '2d', true, false);
  this.registerNavItem('Auto-drive', 'autodrive', true, false);
  this.registerNavItem('Dark Theme', 'dark', true, false);
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
  this.items_[id] = new NavItem(name, id, isToggle, defaultValue);
}

navigate(id) {
  console.log('Navigating to ' + id);
  this.viz_.loadView(id);
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

  // If this is our first load (oldURL is empty), do as if the theme had been
  // changed so that the first setup happens.
  if (!oldUrl || this.darkTheme_ != darkTheme) {
    this.darkTheme_ = darkTheme;
    this.onThemeChanged(this.darkTheme_);
  }
  this.viz_.loadView(viewToLoad);
}

/** @param {boolean} darkTheme Whether the new theme is dark. */
Nav.prototype.onThemeChanged = function(darkTheme) {
  console.log('onTheme Changed, dark? ' + darkTheme);
  document.body.classList.add(darkTheme ? 'dark' : 'light');
  document.body.classList.remove(darkTheme ? 'light' : 'dark');
  this.viz_.onThemeChanged(darkTheme);
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

// function onToggle(e) {
  // let hashes = [];
  // for (let i = 0; i < Nav.NAV_ITEMS.length; i++) {
    // const toggleId = Nav.NAV_ITEMS[i][1];
    // let input = document.getElementById(toggleId);
    // if (!!input && input.checked) {
      // hashes.push(toggleId);
    // }
  // }
  // const baseUrl = window.location.origin + window.location.pathname;
  // const hashList = hashes.join('/');
  // console.log('Setting URL to '+ baseUrl + (!!hashList ? '#' + hashList : ''));
  // window.location.href = baseUrl + (!!hashList ? '#' + hashList : '');
// };

Nav.prototype.setupTopBar = function() {
  this.processHash('', window.location.href);
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
    } else {
      itemEl = document.createElement('li');
      itemEl.textContent = item.getName();
    }
    itemEl.onclick = this.navigate.bind(this, item.getId());
    topBar.firstElementChild.appendChild(itemEl);
  }
    // const toggleId = Nav.TOGGLES[i][1];
    // // TODO: make a proper map
    // let checked = false;
    // if (i == 0 && twoDMode) {
      // checked = true;
    // }
    // if (i == 1 && autoDriveMode) {
      // checked = true;
    // }
    // if (i == 2 && this.darkTheme_) {
      // checked = true;
    // }
  // }

  // for (let i = 0; i < LINKS.length; i++) {
    // const url = window.location.href;
    // const target = LINKS[i][1];
    // if (url.startsWith(target) && url.length - target.length < 2) {
      // item.classList.add('active');
    // }
    // item.onclick = function() {
      // window.location.replace(LINKS[i][1]);
    // }
  // }
}
