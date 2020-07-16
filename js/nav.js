/** @constructor */
let Nav = function(viz) {
  /** @const @private {Viz} */
  this.viz_ = viz;

  /** @private {boolean} */
  this.darkTheme_ = false;
};

/** @const */
Nav.TOGGLES = [
  ['2D Map', '2d'],
  ['Auto-drive', 'autodrive'],
  ['Dark Theme', 'dark'],
];

Nav.VIEWS = [
  ['Case Map', 'casemap'],
  ['Rank', 'rank'],
  ['Sync', 'sync'],
  ['Completeness', 'completeness']
];

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
      // Views
      const h = hashBrown.toLowerCase();
      if (h == 'rank' || h == 'sync' || h == 'completeness') {
        viewToLoad = hashBrown;
        continue;
      }
      // Features
      if (h == '2d') {
        twoDMode = true;
        continue;
      }
      if (h == 'autodrive') {
        autoDriveMode = true;
        document.body.classList.add('autodrive');
        continue;
      }

      if (h == 'dark') {
        darkTheme = true;
        continue;
      }

      // Country codes
      if (hashBrown.length == 2 && hashBrown.toUpperCase() == hashBrown) {
        initialFlyTo = hashBrown;
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

function onToggle(e) {
  let hashes = [];
  for (let i = 0; i < Nav.TOGGLES.length; i++) {
    const toggleId = Nav.TOGGLES[i][1];
    if (document.getElementById(toggleId).checked) {
      hashes.push(toggleId);
    }
  }
  const baseUrl = window.location.origin + window.location.pathname;
  const hashList = hashes.join('/');
  console.log('Setting URL to '+ baseUrl + (!!hashList ? '#' + hashList : ''));
  window.location.href = baseUrl + (!!hashList ? '#' + hashList : '');
};

Nav.prototype.setupTopBar = function() {
  this.processHash('', window.location.href);
  const baseUrl = window.location.origin + '/';
  const LINKS = [
    ['Map', baseUrl],
    ['Rank', baseUrl + '#rank'],
    ['Sync', baseUrl + '#sync'],
    ['Completeness', baseUrl + '#completeness'],
  ];
  let topBar = document.getElementById('topbar');
  topBar.innerHTML = '<ul></ul>';

  for (let i = 0; i < Nav.TOGGLES.length; i++) {
    const toggleId = Nav.TOGGLES[i][1];
    // TODO: make a proper map
    let checked = false;
    if (i == 0 && twoDMode) {
      checked = true;
    }
    if (i == 1 && autoDriveMode) {
      checked = true;
    }
    if (i == 2 && this.darkTheme_) {
      checked = true;
    }
    let item = makeToggle(toggleId, Nav.TOGGLES[i][0], checked);
    topBar.firstElementChild.appendChild(item);
    document.getElementById(toggleId).onclick = onToggle;
  }

  for (let i = 0; i < LINKS.length; i++) {
    let item = document.createElement('li');
    const url = window.location.href;
    const target = LINKS[i][1];
    if (url.startsWith(target) && url.length - target.length < 2) {
      item.classList.add('active');
    }
    item.textContent = LINKS[i][0];
    item.onclick = function() {
      window.location.replace(LINKS[i][1]);
    }
    topBar.firstElementChild.appendChild(item);
  }
}
