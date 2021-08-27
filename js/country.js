/** Represents a country and its characteristics. */
class Country {

constructor(code, name, continent, population, boundingBoxes, centroid) {

  /**
   * This country's two-letter iso code.
   * @type {string}
   * @const
   * @private
   */
  this.code_ = code;

  /**
   * This country's official name, as used in common language.
   * @type {string}
   * @const
   * @private
   */
  this.name_ = name;

  /**
   * A single letter representing the continent where this country is located.
   * A = Africa, E = Europe, Z = Asia, N = North America, S = South America,
   * O = Oceania, P = Antarctica.
   * @type {string}
   * @const
   * @private
   */
  this.continent_ = continent;

  /**
   * This country's population, or zero is it isn't known.
   * @type {number}
   * @const
   * @private
   */
  this.population_ = population;

  /**
   * A list of bounding boxes encapsulating this country's geographical regions.
   * @const
   * @private
   */
  this.boundingBoxes_ = boundingBoxes;

  /**
   * This country's centroid (i.e. the geographical middle), used to decide where
   * to zoom the map to when we focus on this country.
   * @const
   * @private
   */
  this.centroid_ = centroid;
}

}  // Country

/** @return {string} */
Country.prototype.getName = function() {
  return this.name_;
};

/** @return {string} */
Country.prototype.getCode = function() {
  return this.code_;
};

/** @return {string} */
Country.prototype.getContinent = function() {
  return this.continent_;
};

/** @return {number} */
Country.prototype.getPopulation = function() {
  return this.population_;
};

Country.prototype.getMainBoundingBox = function() {
  if (this.centroid_ && this.centroid_.length === 2) {
    // find the first (probably only) bb that contains the country centroid.
    const lat = this.centroid_[0];
    const lon = this.centroid_[1];
    const enclosingBBs = this.boundingBoxes_.filter((box) => {
      const bb = box.map(x => parseFloat(x));
      return lat > bb[1] && lat < bb[3] && lon > bb[0] && lon < bb[2];
    });
    if (enclosingBBs.length > 0) {
      return enclosingBBs[0];
    }
  }
  // Assume the 'main' geographical region is listed first.
  return this.boundingBoxes_[0];
};

/** Returns an array of [lat, long] for this country's center. */
Country.prototype.getCentroid = function() {
  if (this.centroid_ && this.centroid_.length === 2) {
    return this.centroid_;
  }
  const bb = this.getMainBoundingBox().map(x => parseFloat(x));
  return [((bb[0] + bb[2]) / 2).toFixed(4), ((bb[1] + bb[3]) / 2).toFixed(4)];
}
