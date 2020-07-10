/** @interface */
let View = function(dataProvider) {};

View.prototype.fetchData = function() { };

View.prototype.render = function() { };

View.prototype.onThemeChanged = function(darkTheme) { };
