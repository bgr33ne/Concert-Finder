function ViewModel() {

  var self = this;
  var map, city, infoWindow;
  //api for songkick
  var songkickApi = 'KrsaEhuwC3Y3T21B';
  //api for meetup not in use currently
  //adding data from meetup api not in use
  //this.currentMeetups = ko.observableArray([]);

  //pushing data from songkick into this array
  this.currentConcerts = ko.observableArray([]);

  //holds mapmarkers
  this.mapMarkerList = ko.observableArray([]);

  //binding for search input, status and location
  this.searchBar = ko.observable();
  this.searchLocation = ko.observable('New York, NY');
  //holds value from search
  this.searchList = ko.observableArray([]);

  //holds lat + lng for switching cities , switching not currently implemented
  this.currentLat = ko.observable(40.765353);
  this.currentLng = ko.observable(-73.979924);

  //toggle value for list view
  this.toggleVal = ko.observable('hide');

  //When a deal on the list is clicked, go to corresponding marker and open its info window.
  this.findMarker = function(clickedConcert) {
    var clickedConcertName = clickedConcert.concertArtist;
    console.log('CONCERT CLICKED!!! ' + clickedConcertName);
    for (var key in self.mapMarkerList()) {
      if (clickedConcertName === self.mapMarkerList()[key].marker.title) {
        map.panTo(self.mapMarkerList()[key].marker.position);
        infoWindow.setContent(self.mapMarkerList()[key].content);
        infoWindow.open(map, self.mapMarkerList()[key].marker);

        //adds bounce animation to marker
        self.mapMarkerList()[key].marker.setAnimation(google.maps.Animation.BOUNCE);
        //limits the bounce to one time immediately after click
        //NOT WORKING
        setTimeout(function(){ self.mapMarkerList()[key].marker.setAnimation(null); }, 750);
      }
    }
  };

  //adding search functionaliy here
  //search works but doesn't draw markers correctly
  this.searchResults = function() {
    console.log('search started!!!');
    var searchElem = self.searchBar().toLowerCase();
    console.log('search elem: ' + searchElem);
    var array = self.currentConcerts();
    //var array = self.mapMarkerList();

    //clear search array before starting
    self.searchList([]);

    //loop through array to find search results
    for (i=0; i < array.length; i++) {
      if (array[i].concertArtist.toLowerCase().indexOf(searchElem) != -1) {
        console.log('wow');
        //self.mapMarkerList()[i].marker.setMap(map);
        self.mapMarkerList()[i].marker.setMap(map);
        self.searchList.push(array[i]);
        console.log('currentConcert listing' + array[i].concertArtist);
      } else {
        //no search found clears map
        console.log("shit");
        self.mapMarkerList()[i].marker.setMap(null);
      }
    }
  };

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


  //initializes map and canvas, populates with info from api with getconcerts function call
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
  //need to add lat + lon passed through the search function and inputted into songKickUrl for location search, currently not implemented
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
        }
        console.log('currentconcerts object: ' + self.currentConcerts());
        //this will load data into the list view and can later be changed with search
        self.searchList(self.currentConcerts());
        //loads first mapmarkers.
        mapMarkers(self.currentConcerts());
      }

    });
  }

  //creates loads map markers and info windows on the mapfrom API
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
        '<h4>' + value.concertArtist + '</h4>' +
        '<a href="' + value.concertUrl + '"">More info' +
        '</a>' + '</div>';

      var marker = new google.maps.Marker({
        position: geoLoc,
        title: thisArtist,
        //animation causes a flicker
        animation: google.maps.Animation.DROP,
        map: map
      });

      //this is used to grab data from list view
      self.mapMarkerList.push( {
        marker: marker,
        content: contentString
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

//removed this function call and replaced with loadmap
//ko.applyBindings(new ViewModel());

//added a function to fix the async defer error with google maps script call
function loadApp() {
  ko.applyBindings(new ViewModel());
}
