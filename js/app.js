function appViewModel() {

  var self = this;
  var map, city, infoWindow;
  //api for songkick
  var songkickApi = 'KrsaEhuwC3Y3T21B';
  //api for meetup
  var meetupApi = '6f12f4a77127e41662e1252547a3933';

  //pushing data from songkick into this array
  this.currentConcerts = ko.observableArray([]);

  //adding data from meetup api
  this.currentMeetups = ko.observableArray([]);

  //holds all mapmarkers
  //this.mapMarkers = ko.observableArray([]);

  //binding for search input, status and location
  this.searchBar = ko.observable();
  this.searchLocation = ko.observable('New York, NY');

  //holds lat + lng for switching cities
  this.currentLat = ko.observable(40.765353);
  this.currentLng = ko.observable(-73.979924);

  //toggle value for list view
  this.toggleVal = ko.observable('hide');


  //opens list view when button is clicked
  this.toggleList = function() {
    console.log('toggleList called!');
    if(self.toggleVal() === 'hide') {
      self.toggleVal('show');
    } else {
      self.toggleVal('hide');
    }
  };


  //map error handling
  this.mapRequestTimeout = setTimeout(function() {
  $('#map-canvas').html('We had trouble loading Google Maps. Please refresh your browser and try again.');
  }, 8000);

  function initMap() {
    lat = self.currentLat();
    lng = self.currentLng();
    city = new google.maps.LatLng(lat, lng);
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: city,
      zoom: 12,
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

    infoWindow = new google.maps.InfoWindow({maxWidth: 300});

    //put in data from songkick marker function here
    getConcerts('New York, NY');

    //mapMarkers(self.currentConcerts());
  }

  //uses SongKick API to grab concerts
  function getConcerts(location) {
  //need to add lat + lon passed through the search function and inputted into songKickUrl
  var songKickUrl = 'http://api.songkick.com/api/3.0/events.json?apikey=' + songkickApi + '&location=geo:' + 40.765353 + ',' + -73.979924 +  '&jsoncallback=?';
  //need to add link back to display name on main map

    $.ajax({
      url: songKickUrl,
      dataType: 'jsonp',
      // jsonp "callback",
      success: function( data ) {
        console.log(data);
        var concerts = data.resultsPage.results.event;
        var len = concerts.length;
        console.log('len: ' + len);

        for (var i = 0; i < len; i++) {
          var concertElem = data.resultsPage.results;
          var concertVenue = concertElem.event[i].venue;
          var artist = concertElem.event[i].displayName;
          //console.log('artist: ' + artist);
          var url = concertElem.event[i].uri;
          //console.log('url: ' + url);

          //venueLat = concertElem.event[i].venue.lat;
          venueLat = concertVenue.lat;
          //console.log('lat: ' + concertVenue.lat);
          venueLng = concertVenue.lng;
          //console.log('lon: ' + concertVenue.lng);
          venueName = concertVenue.displayName;
          //console.log('name: ' + concertVenue.displayName);


          self.currentConcerts.push({
          //these values passed into concertLocations array
            concertLat: venueLat,
            concertLng: venueLng,
            concertVenueName: venueName,
            concertArtist: artist,
            concertUrl: url
          });
        };
        console.log('currentconcerts object: ' + self.currentConcerts());
        mapMarkers(self.currentConcerts());
        //mapMarkers(currentConcerts);

      }
      //clearTimeout(wikiRequestTimeout);
    });
  }

  //creates loads map markers and info windows on the mapfrom API
  //need to replace conertlat concert lon with values from jsonp songkick
  //currently having an issue with value
  function mapMarkers(array) {
    arrayVal = array[0];
    len = array.length;
    console.log('array length: ' + len);


    $.each(array, function(index, value) {
      var lat = value.concertLat;
      //console.log('Lat:' + lat);
      var lon = value.concertLng;
      //console.log('lng: ' + lon);
      var geoLoc = new google.maps.LatLng(lat, lon);
      var thisArtist = value.concertArtist;
      //console.log('artist: ' + thisArtist);

      var contentString = '<div id="info-window">' +
        '<h4>' + value.concertArtist + '</h4>'
         + '<a href="' + value.concertUrl + '"">More info' +
         '</a>' + '</div>';

      var marker = new google.maps.Marker({
        position: geoLoc,
        title: thisArtist,
        //animation causes a flicker
        animation: google.maps.Animation.DROP,
        map: map
      });

      //concert event listener, opens popup and bounces the marker
      google.maps.event.addListener(marker, 'click', function() {
         infoWindow.setContent(contentString);
         infoWindow.open(map, marker);
         toggleBounce();
       });

      //function to bounce the marker
      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          //limits the bounce to one time immediately after click
          setTimeout(function(){ marker.setAnimation(null); }, 750);
        }
      }
    });
  }
  initMap();
}

ko.applyBindings(new appViewModel());
