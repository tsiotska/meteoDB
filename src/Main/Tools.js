import turf from 'turf'
import L from 'leaflet';

export L.Polygon.include({
  contains: function(latLng) {
    return turf.inside(new L.Marker(latLng).toGeoJSON(), this.toGeoJSON());
  }
});

export L.Rectangle.include({
  contains: function(latLng) {
    return this.getBounds().contains(latLng);
  }
});

export L.Circle.include({
  contains: function(latLng) {
    return this.getLatLng().distanceTo(latLng) < this.getRadius();
  }
});
export default class Tools {}