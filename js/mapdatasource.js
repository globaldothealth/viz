class MapDataSource {

constructor() {}

getLegendItems() {
  let items = [];
  for (let i = 0; i < MapDataSource.CASE_MAP_COLORS.length; i++) {
    let color = MapDataSource.CASE_MAP_COLORS[i];
    let item = document.createElement('li');
    let circle = document.createElement('span');
    circle.className = 'circle';
    circle.style.backgroundColor = color[0];
    let label = document.createElement('span');
    label.className = 'label';
    label.textContent = color[1];
    item.appendChild(circle);
    item.appendChild(label);
    items.push(item);
  }
  return items;
}
}

/** @const */
MapDataSource.CASE_MAP_COLORS = [
  ['#67009e', '< 10', 10],
  ['#921694', '11–100', 100],
  ['#d34d60', '101–500', 500],
  ['#fb9533', '501–2000', 2000],
  ['#edf91c', '> 2000'],
  ['cornflowerblue', 'New'],
];
