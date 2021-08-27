class SideBar {

constructor(dataProvider, caseMapView, container) {
  /** @private @const {DataProvider} */
  this.dataProvider_ = dataProvider;

  /** @const @private {CaseMapView} */
  this.caseMapView_ = caseMapView;

  /** @const @private {!Element} */
  this.element_ = container;

  /** @const @private {boolean} */
  this.showPerCapitaOption_ = false;

  /** @const {Array.<string>} */
  this.otherDiseases_ = '{{OTHER_DISEASES}}'.split(',');
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
      'location-list').getElementsByTagName('div');
  let clearFilter = document.getElementById('clear-filter');
  // Loop through all list items, and hide those who don't match the search
  // query.
  for (let i = 0; i < list_items.length; ++i) {
    let label = list_items[i].getElementsByClassName('label')[0];
    if (!label) {
      continue;
    }
    let txtValue = label.textContent || label.innerText;
    // Show/hide the clear filter button.
    clearFilter.style.display = !!filter ? 'inline-block' : 'none';

    // Show/hide matching list items.
    const show = txtValue.toUpperCase().indexOf(filter) != -1;
    list_items[i].style.display = show ? 'block' : 'none';
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

/** @private */
SideBar.prototype.createPerCapitaCheckbox_ = function() {
  let perCapitaContainer = document.createElement('div');
  perCapitaContainer.setAttribute('id', 'per-capita-container');
  let checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'percapita');
  let label = document.createElement('label');
  label.setAttribute('for', 'percapita');
  label.textContent = 'Per Capita';
  perCapitaContainer.appendChild(checkbox);
  perCapitaContainer.appendChild(label);
  this.element_.insertBefore(perCapitaContainer,
                             document.getElementById('location-list'));

  checkbox.addEventListener('change',
                            this.updateCountryListCounts.bind(this));
}

SideBar.prototype.renderDiseaseSelector = function() {
  const container = document.getElementById('disease-selector');
  let rendered = '';
  for (let i = 0; i < this.otherDiseases_.length; i++) {
    let parts = this.otherDiseases_[i].split('|');
    rendered += '<div><a href="' + parts[2] + '">' + parts[1] + '</a></div>';
  }
  container.innerHTML = rendered;
  container.style.display = 'none';
  document.getElementById('sidebar-header').onclick = function() {
    const container = document.getElementById('disease-selector');
    container.style.display = container.style.display == 'none' ? 'block' : 'none';
  };
}

SideBar.prototype.render = function() {
  this.element_.innerHTML = '<div id="sidebar-tab"></div><div id="sidebar-header"><h1 id="total" class="sidebar-title total">COVID-19 LINE LIST CASES</h1><br/>'
                            //  +'<h1 id="voc1" class="sidebar-title voc">Variant P.1</h1><h1 id="voc2" class="sidebar-title voc">Variant B.1.351</h1>'
                              + '<div id="disease-selector"></div></div><div id="latest-global"></div><div id="location-filter-wrapper"></div><div id="location-list"></div><div id="ghlist">See all cases <img src="/img/gh_list_logo.svg"><span>Data</span></div>';
  document.getElementById('sidebar').classList.add(window.location.hash);
  const tabEl = document.getElementById('sidebar-tab');
  let icon = document.createElement('span');
  if (this.showPerCapitaOption_) {
    this.createPerCapitaCheckbox_();
  }
  icon.setAttribute('id', 'sidebar-tab-icon');
  icon.textContent = '◀';
  tabEl.appendChild(icon);
  tabEl.onclick = this.toggle;
  // this.renderDiseaseSelector();
  this.renderLatestCounts();
  
  this.renderSearch(document.getElementById('location-filter-wrapper'));
  document.getElementById('total').onclick = function(e) {
    window.location.href = '/#country';
    window.location.reload();
  }

  // document.getElementById('voc1').onclick = function(e) {
  //   window.location.href = '/#country-p1';
  //   window.location.reload();
  // }

  // document.getElementById('voc2').onclick = function(e) {
  //   window.location.hash = '/#country-b1351';
  //   window.location.reload();
  // }

  document.getElementById('ghlist').onclick = function(e) {
    window.location.href = 'https://data.covid-19.global.health/  ';
  };

};

SideBar.prototype.renderSearch = function(container) {
  let searchInput = document.createElement('input');
  searchInput.setAttribute('id', 'location-filter');
  searchInput.setAttribute('placeholder', 'Search');
  searchInput.onkeyup = filterList;
  let clearEl = document.createElement('div');
  clearEl.setAttribute('id', 'clear-filter');
  clearEl.innerHTML = '&times;';
  clearEl.onclick = clearFilter;
  container.appendChild(searchInput);
  container.appendChild(clearEl);
};

SideBar.prototype.renderLatestCounts = function() {
  let latestEl = document.getElementById('latest-global');
  latestEl.innerHTML = '<span id="total-cases" class="active"></span><span id="p1-cases"></span><span id="b1351-cases"></span><span class="reported-cases-label"> cases</span><br/>'+
  // <span id="total-deaths"></span><span class="total-deaths-label">deaths</span>
  '<br /><div class="last-updated-date">Updated: <span id="last-updated-date"></span></div>';
  const latest = this.dataProvider_.getLatestGlobalCounts();
  document.getElementById('total-cases').innerText = latest[0].toLocaleString();
  document.getElementById('p1-cases').innerText = latest[2].toLocaleString();
  document.getElementById('b1351-cases').innerText = latest[3].toLocaleString();
  // document.getElementById('total-deaths').innerText = latest[1].toLocaleString();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  document.getElementById('last-updated-date').innerText = yesterday.toDateString();
};

SideBar.prototype.makeCaseCountProgressBar = function(caseCount, maxCaseCount) {
  let bar = document.createElement('div');
  bar.classList.add('country-cases-bar');
  // Use a value slightly lower than
  let widthPercent = Math.floor(100 * caseCount / maxCaseCount);
  bar.style.width = '' + widthPercent + '%';
  return bar;
}

SideBar.prototype.renderCountryList = function() {
  let countryList = document.getElementById('location-list');

  const latestDate = this.dataProvider_.getLatestDate();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);

  if (!dehydratedFeatures || dehydratedFeatures.length < 1) {
    console.log('No data for rendering country list');
    return;
  }

  // Sort according to decreasing confirmed cases.
  // dehydratedFeatures.sort(function(a, b) {
  //   return b['total'] - a['total'];
  // });

  const sortedKeys = Object.keys(dehydratedFeatures).sort( function(keyA, keyB) {
    return dehydratedFeatures[keyB]['total'] - dehydratedFeatures[keyA]['total'];
  });

  const maxConfirmedCases = this.dataProvider_.getLatestGlobalCounts();
  // for (var key in sortedList) {
  for (let i = 0; i < sortedKeys.length; i++) {
  // for (let i = 0; i < latestAggregateData.length; ++i) {
    let key = sortedKeys[i];
    if (!key || !dehydratedFeatures[key]['name']) {
      // We can't do much with this location.
      continue;
    }
    const code = key;
    const country = this.dataProvider_.getCountry(code);
    if (!country) {
      continue;
    }
    const name = country.getName();
    const geoid = country.getCentroid().join('|');
    let cumConf = parseInt(dehydratedFeatures[key]['total'], 10) || 0;
    let legendGroup = 'default';

    // If the page we are on doesn't have the corresponding UI, we don't need
    // to do anything else.
    if (!!countryList) {
      // No city or province, just the country code.
      locationInfo[geoid] = '||' + code;

      let item = document.createElement('div');
      item.classList.add('location-list-item');
      item.classList.add('location-list-total');
      let button = document.createElement('button');
      button.setAttribute('country', code);
      button.onclick = this.flyToCountry.bind(this);
      button.innerHTML = '<span class="label">' + name + '</span>' +
          '<span class="num">' + cumConf.toLocaleString() + '</span>';
      item.appendChild(button);
      item.appendChild(this.makeCaseCountProgressBar(cumConf, maxConfirmedCases[0]));
      countryList.appendChild(item);
    }
  }
}

SideBar.prototype.renderCountryListP1 = function() {
  let countryList = document.getElementById('location-list');

  const latestDate = this.dataProvider_.getLatestDate();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);

  if (!dehydratedFeatures || dehydratedFeatures.length < 1) {
    console.log('No data for rendering country list');
    return;
  }

  // Sort according to decreasing confirmed cases.
  // dehydratedFeatures.sort(function(a, b) {
  //   return b['total'] - a['total'];
  // });

  const sortedKeys = Object.keys(dehydratedFeatures).sort( function(keyA, keyB) {
    return dehydratedFeatures[keyB]['p1'] - dehydratedFeatures[keyA]['p1'];
  });

  const maxConfirmedCases = this.dataProvider_.getLatestGlobalCounts();
  // for (var key in sortedList) {
  for (let i = 0; i < sortedKeys.length; i++) {
  // for (let i = 0; i < latestAggregateData.length; ++i) {
    let key = sortedKeys[i];
    if (!key || !dehydratedFeatures[key]['name']) {
      // We can't do much with this location.
      continue;
    }
    const code = key;
    const country = this.dataProvider_.getCountry(code);
    if (!country) {
      continue;
    }
    const name = country.getName();
    const geoid = country.getCentroid().join('|');
    let cumConf = parseInt(dehydratedFeatures[key]['p1'], 10) || 0;
    let legendGroup = 'default';

    // If the page we are on doesn't have the corresponding UI, we don't need
    // to do anything else.
    if (!!countryList) {
      // No city or province, just the country code.
      locationInfo[geoid] = '||' + code;

      let item = document.createElement('div');
      item.classList.add('location-list-item','location-list-p1');
      let button = document.createElement('button');
      button.setAttribute('country', code);
      button.onclick = this.flyToCountry.bind(this);
      button.innerHTML = '<span class="label">' + name + '</span>' +
          '<span class="num">' + cumConf.toLocaleString() + '</span>';
      item.appendChild(button);
      item.appendChild(this.makeCaseCountProgressBar(cumConf, maxConfirmedCases[2]));
      countryList.appendChild(item);
    }
  }
}

SideBar.prototype.renderCountryListB1351 = function() {
  let countryList = document.getElementById('location-list');

  const latestDate = this.dataProvider_.getLatestDate();
  // This is a map from country code to the corresponding feature.
  let dehydratedFeatures = this.dataProvider_.getCountryFeaturesForDay(latestDate);

  if (!dehydratedFeatures || dehydratedFeatures.length < 1) {
    console.log('No data for rendering country list');
    return;
  }

  // Sort according to decreasing confirmed cases.
  // dehydratedFeatures.sort(function(a, b) {
  //   return b['total'] - a['total'];
  // });

  const sortedKeys = Object.keys(dehydratedFeatures).sort( function(keyA, keyB) {
    return dehydratedFeatures[keyB]['b1351'] - dehydratedFeatures[keyA]['b1351'];
  });

  const maxConfirmedCases = this.dataProvider_.getLatestGlobalCounts();
  // for (var key in sortedList) {
  for (let i = 0; i < sortedKeys.length; i++) {
  // for (let i = 0; i < latestAggregateData.length; ++i) {
    let key = sortedKeys[i];
    if (!key || !dehydratedFeatures[key]['name']) {
      // We can't do much with this location.
      continue;
    }
    const code = key;
    const country = this.dataProvider_.getCountry(code);
    if (!country) {
      continue;
    }
    const name = country.getName();
    const geoid = country.getCentroid().join('|');
    let cumConf = parseInt(dehydratedFeatures[key]['b1351'], 10) || 0;
    let legendGroup = 'default';

    // If the page we are on doesn't have the corresponding UI, we don't need
    // to do anything else.
    if (!!countryList) {
      // No city or province, just the country code.
      locationInfo[geoid] = '||' + code;

      let item = document.createElement('div');
      item.classList.add('location-list-item','location-list-b1351');
      let button = document.createElement('button');
      button.setAttribute('country', code);
      button.onclick = this.flyToCountry.bind(this);
      button.innerHTML = '<span class="label">' + name + '</span>' +
          '<span class="num">' + cumConf.toLocaleString() + '</span>';
      item.appendChild(button);
      item.appendChild(this.makeCaseCountProgressBar(cumConf, maxConfirmedCases[3]));
      countryList.appendChild(item);
    }
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
    const perCapitaCheckbox = document.getElementById('percapita');
    if (!!perCapitaCheckbox && perCapitaCheckbox.checked) {
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
