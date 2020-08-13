class SideBar {

constructor(dataProvider, caseMapView, container) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @const @private {CaseMapView} */
  this.caseMapView_ = caseMapView;

  /** @const @private {!Element} */
  this.element_ = container;
}

toggle() {
  const previouslyHidden = document.body.classList.contains('sidebar-hidden');
  document.getElementById('sidebar-tab-icon').textContent =
        previouslyHidden ? '◀' : '▶';
  document.body.classList.toggle('sidebar-hidden');
}

}

// Filter list of locations
function filterList() {
  let filter = document.getElementById('location-filter').value.toUpperCase();
  let ul = document.getElementById('location-list');
  let list_items = document.getElementById(
      'location-list').getElementsByTagName('li');
  let clearFilter = document.getElementById('clear-filter');
  // Loop through all list items, and hide those who don't match the search
  // query.
  for (let i = 0; i < list_items.length; ++i) {
    let label = list_items[i].getElementsByClassName('label')[0];
    let txtValue = label.textContent || label.innerText;
    // Show/hide the clear filter button.
    clearFilter.style.display = !!filter ? 'flex' : 'none';

    // Show/hide matching list items.
    const show = txtValue.toUpperCase().indexOf(filter) != -1;
    list_items[i].style.display = show ? 'list-item' : 'none';
  }
}

function clearFilter() {
  document.getElementById('location-filter').value = '';
  filterList();
}

SideBar.prototype.flyToCountry = function(event) {
  let target = event.target;
  while (!target.getAttribute('country')) {
    target = target.parentNode;
  }
  const code = target.getAttribute('country');
  if (!code) {
    return;
  }
  this.caseMapView_.flyToCountry(code);
}

SideBar.prototype.render = function() {
  this.element_.innerHTML = '<div id="sidebar-tab"></div><div class="sidebar-header"><img src="img/gh_logo_white.svg" style="width: 7ex; margin-right: 1ex; display: none;" /><h1 class="sidebar-title">{{TITLE}}</h1></div><div id="latest-global"></div><div id="per-capita-container"><input type="checkbox" id="percapita"><label for="percapita">Per capita</label></div><div id="location-list"></div>';
  const tabEl = document.getElementById('sidebar-tab');
  let icon = document.createElement('span');
  icon.setAttribute('id', 'sidebar-tab-icon');
  icon.textContent = '▶';
  tabEl.appendChild(icon);
  tabEl.onclick = this.toggle;
  document.getElementById('percapita').addEventListener('change',
      this.updateCountryListCounts.bind(this));
  this.renderLatestCounts();
};

SideBar.prototype.renderLatestCounts = function() {
  let latestEl = document.getElementById('latest-global');
  latestEl.innerHTML = '<span id="total-cases"></span><span class="reported-cases-label">cases</span><br /><span id="total-deaths"></span><span class="total-deaths-label">deaths</span><br /><div class="last-updated-date">Updated <span id="last-updated-date"></span></div>';
  const latest = this.dataProvider_.getLatestGlobalCounts();
  document.getElementById('total-cases').innerText = latest[0].toLocaleString();
  document.getElementById('total-deaths').innerText = latest[1].toLocaleString();
  document.getElementById('last-updated-date').innerText = latest[2];
};

SideBar.prototype.renderCountryList = function() {
  let countryList = document.getElementById('location-list');
  const latestAggregateData = this.dataProvider_.getLatestAggregateData();
  if (!latestAggregateData) {
    console.log('No data for rendering country list');
    return;
  }

  // Sort according to decreasing confirmed cases.
  latestAggregateData.sort(function(a, b) {
    return b['cum_conf'] - a['cum_conf'];
  });
  for (let i = 0; i < latestAggregateData.length; ++i) {
    let location = latestAggregateData[i];
    if (!location || !location['code']) {
      // We can't do much with this location.
      continue;
    }
    const code = location['code'];
    const country = this.dataProvider_.getCountry(code);
    if (!country) {
      continue;
    }
    const name = country.getName();
    const geoid = country.getCentroid().join('|');
    let cumConf = parseInt(location['cum_conf'], 10) || 0;
    let legendGroup = 'default';

    // If the page we are on doesn't have the corresponding UI, we don't need
    // to do anything else.
    if (!!countryList) {
      // No city or province, just the country code.
      locationInfo[geoid] = '||' + code;
      if (cumConf <= 10) {
        legendGroup = '10';
      } else if (cumConf <= 100) {
        legendGroup = '100';
      } else if (cumConf <= 500) {
        legendGroup = '500';
      } else if (cumConf <= 2000) {
        legendGroup = '2000';
      }

      let item = document.createElement('li');
      let button = document.createElement('button');
      button.setAttribute('country', code);
      button.onclick = this.flyToCountry.bind(this);
      button.innerHTML = '<span class="label">' + name + '</span>' +
          '<span class="num legend-group-' + legendGroup +
          '"></span>';
      item.appendChild(button);
      countryList.appendChild(item);
    }
  }
  if (!!countryList) {
    this.updateCountryListCounts();
  }
}

SideBar.prototype.updateCountryListCounts = function() {
  const list = document.getElementById('location-list');
  let countSpans = list.getElementsByClassName('num');
  for (let i = 0; i < countSpans.length; i++) {
    let span = countSpans[i];
    const code = span.parentNode.getAttribute('country');
    const country = this.dataProvider_.getCountry(code);
    let countToShow = this.dataProvider_.getLatestDataPerCountry()[code][0];
    if (document.getElementById('percapita').checked) {
      const population = country.getPopulation();
      if (!!population) {
        countToShow = '' + (100 * countToShow / country.getPopulation()).
              toFixed(3) + '%';
      } else {
        countToShow = '?';
      }
    } else {
      countToShow = countToShow.toLocaleString();
    }
    span.textContent = countToShow;
  }
  this.sortCountryList();
};

SideBar.prototype.sortCountryList = function() {
  const list = document.getElementById('location-list');
  let items = list.children;
  let itemsArray = [];
  for (let i = 0; i < items.length; i++) {
    itemsArray.push(items[i]);
  }
  itemsArray.sort(function(a, b) {
    const str_a = a.getElementsByClassName(
        'num')[0].textContent.replace(/,/g, '');
    const str_b = b.getElementsByClassName(
        'num')[0].textContent.replace(/,/g, '');
    if (str_a == '?') { return 1; }
    if (str_b == '?') { return -1;}
    const count_a = parseFloat(str_a);
    const count_b = parseFloat(str_b);
    return count_a == count_b ? 0 : (count_a < count_b ? 1 : -1);
  });

  for (let i = 0; i < itemsArray.length; i++) {
    list.appendChild(itemsArray[i]);
  }
};

globalThis['clearFilter'] = clearFilter;
globalThis['filterList'] = filterList;
