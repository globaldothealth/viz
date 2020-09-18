function testNormalizeGeoId() {
  assertEquals('0.0000|0.0000', DataProvider.normalizeGeoId('0|0'),
               'GeoId normalization');
  assertEquals('5.0000|-10.1234', DataProvider.normalizeGeoId('5|-10.12343'),
               'GeoId normalization');
}
