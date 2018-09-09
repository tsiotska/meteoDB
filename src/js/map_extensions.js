import L from 'leaflet';
import turf from 'turf'
L.Polygon.include({
  contains: function(latLng) {
    return turf.inside(new L.Marker(latLng).toGeoJSON(), this.toGeoJSON());
  }
});

L.Rectangle.include({
  contains: function(latLng) {
    return this.getBounds().contains(latLng);
  }
});

L.Circle.include({
  contains: function(latLng) {
    return this.getLatLng().distanceTo(latLng) < this.getRadius();
  }
});
