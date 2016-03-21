function appViewModel() {

  var self = this;
  var map, city, infowindow;

  var concertLocations = [];
  var concertMarkers = [];

  //holds lat + lng
  this.currentLat = ko.observable(40.765353);
  this.currentLng = ko.observable(-73.979924);


  //map error handling
  this.mapRequestTimeout = setTimeout(function() {
    $('#map-canvas').html('We had trouble loading Google Maps. Please refresh your browser and try again.');
  }, 8000);

  function initMap() {
    city = new google.maps.LatLng(40.765353, -73.979924);
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: city,
      zoom: 15,
      //restyling the google maps controls
      zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
              style: google.maps.ZoomControlStyle.SMALL
            },
            streetViewControlOptions: {
              position: google.maps.ControlPosition.LEFT_BOTTOM
              },
            mapTypeControl: false,
            panControl: false
          });
      clearTimeout(self.mapRequestTimeout);

      google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
      });

      infowindow = new google.maps.InfoWindow({maxWidth: 300});
      //put in data from songkick marker function here
    }

    //uses SongKick API to grab concerts
    function getConcerts(location) {
      var songkickUrl = 'http://api.songkick.com/api/3.0/';
      //need to add link back to display name on main map

    }


  initMap();

}

ko.applyBindings(new appViewModel());
