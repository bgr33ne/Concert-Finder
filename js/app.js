function appViewModel() {

  var self = this;
  var map, city, infowindow;
  //api for songkick
  var songkickApi = 'KrsaEhuwC3Y3T21B';

  var concertLocations = [];
  var concertMarkers = [];


  this.mapMarkers = ko.observableArray([]);

  //binding for search input, status and location
  this.searchStatus = ko.observable();
  this.searchLocation = ko.observable('New York, NY');

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

      //pass info from initial objects and api into this area later to setup mvvm
      var myLatLng = {lat: 40.765353, lng: -73.979924};
      var marker = new google.maps.Marker({
        draggable: true,
        position: myLatLng,
        animation: google.maps.Animation.DROP,
        map: map,
        title: 'Hello World!'
      });
      //listener that opens window and bounces marker when clicked
      marker.addListener('click', function() {
        toggleBounce;
        infowindow.open(map, marker);
      });

      //adds animation if you click the marker

      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }

      infowindow = new google.maps.InfoWindow({maxWidth: 300});
      //put in data from songkick marker function here
      getConcerts('New York, NY');
    }

    //uses SongKick API to grab concerts
    function getConcerts(location) {
      var loc = location;
      //added a 1-week time filter
      var songKickUrl = 'http://api.songkick.com/api/3.0/events.json?apikey=' + songkickApi + '&location=geo:' + 40.765353 + ',' + -73.979924 +  '&jsoncallback=?';
      //need to add link back to display name on main map
      //console.log(this.currentLng);

      $.ajax({
        url: songKickUrl,
        dataType: 'jsonp',
        // jsonp "callback",
        success: function( data ) {
          console.log(data);
          var concerts = data.resultsPage.results.event;
          console.log(data.resultsPage.results.event[1]);
            console.log('Number of concerts: ' + concerts.length);
          for (var i = 0; i < concerts.length; i++) {
            var concert = concerts[i];
            //console.log(concert);

          //articleStr = articleList[i];
          //var url = 'http://en.wikipedia.org/wiki/' + articleStr;
          //$wikiElem.append('<li><a href="' + url + '">' +
          //  articleStr + '</a></li>');
          };

        //clearTimeout(wikiRequestTimeout);
        }
      });


      //creates loads map markers and info windows on the mapfrom API
      //need to replace conertlat concert lon with values from jsonp songkick
      function addMapMarkers(array) {
        $.each(array, function(index, value) {
        var lat = value.location.lng,
            lon = value.location.lon,
            geoLoc = new google.maps.LatLng(lat, lon),
            thisArtist = value.performance.artist.displayName;
        });

        var contentString = '<div id="infowindow">' +
        '<h3>' + value.performance.artist.displayName + '</h3>' +
        '<p>all the magical info about this artist' + '</p>' + '</div>';

        var marker = new google.maps.Marker({
            position: geoLoc,
            title: thisConcert,
            map: map
        });
      }


  }


  initMap();

}

ko.applyBindings(new appViewModel());
