/** @constructor */
let Nav = function() { };

/** @const */
Nav.TOGGLES = [
  ['3D Map', '3d'],
  ['Auto-drive', 'autodrive'],
  ['Dark Theme', 'dark'],
];



function processHash(oldUrl, newUrl) {
  console.log('Process hash');
  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  const oldHashes = !!oldUrl ? oldUrl.substring(baseUrl.length).split('/') : [];
  const newHashes = newUrl.substring(baseUrl.length).split('/');
  darkTheme = false;
  if (newHashes.length > 0 || oldHashes.length > 0) {
    for (let i = 0; i < newHashes.length; i++) {
      let hashBrown = newHashes[i];
      if (hashBrown.startsWith('#')) {
        hashBrown = hashBrown.substring(1);
      }
      if (hashBrown.toLowerCase() == 'autodrive') {
        autoDriveMode = true;
        document.body.classList.add('autodrive');
        continue;
      }

      if (hashBrown.toLowerCase() == 'dark') {
        darkTheme = true;
        continue;
      }

      // Country codes
      if (hashBrown.length == 2 && hashBrown.toUpperCase() == hashBrown) {
        initialFlyTo = hashBrown;
      }
    }
  }
  onThemeChanged();
}

function onThemeChanged() {
  document.body.classList.add(darkTheme ? 'dark' : 'light');
  document.body.classList.remove(darkTheme ? 'light' : 'dark');
  map.setStyle(darkTheme);
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
}

function setupTopBar() {
  const baseUrl = window.location.origin + '/';
  const LINKS = [
    ['Map', baseUrl],
    ['Rank', baseUrl + 'rank'],
    ['Sync', baseUrl + 'sync'],
    ['Completeness', baseUrl + 'completeness'],
  ];
  let topBar = document.getElementById('topbar');
  topBar.innerHTML = '<ul></ul>';

  for (let i = 0; i < Nav.TOGGLES.length; i++) {
    const toggleId = Nav.TOGGLES[i][1];
    let item = makeToggle(toggleId, Nav.TOGGLES[i][0], false /* checked */);
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
