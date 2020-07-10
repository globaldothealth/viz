/** @interface */
let View = function(dataProvider, nav) {};

View.prototype.fetchData = function() { };

View.prototype.render = function() { };

View.prototype.onThemeChanged = function(darkTheme) { };
