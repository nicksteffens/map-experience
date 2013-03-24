Experience = {
  // initialize
  initialize: function() {
    Experience.setVars();
    // Experience.setMarkers();
    Experience.setIntro();
  },

  setVars: function() {
    // set starting point
    Experience.startingPoint = Utility.newLatLng(-1.993006, -67.286072);

    // set options
    Experience.mapOptions = {
      zoom: 5,
      center: Experience.startingPoint,
      // UI specific stuff
      disableDefaultUI: true,
      // map type
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    // create map
    Experience.map = Utility.newMap('map-canvas', Experience.mapOptions);
  },

  setMarkers: function() {
  },

  // sets the first window to be open
  setIntro: function() {
    Experience.introduction = [];
    var intro = Utility.createIntro(Content.introduction);
    Utility.infoWin.openWindow(Experience.introduction[0], Experience.map);
    Listeners.google.domReady(Experience.introduction[0], Listeners.introduction(Experience.introduction[0]));
  }

};


// eventListeners
Listeners = {

  introduction: function(obj) {
    $('.screen a.next').on('click', function(e){
      e.preventDefault();
      var nextScreen = parseInt($(this).attr('href').slice(1));
      if(nextScreen > Experience.introduction.length) {
        console.log('has next');
        Listeners.google.removedListener(obj);
        Utility.infoWin.closeWindow(obj);
        Utility.infoWin.openWindow(Experience.introduction[nextScreen], Experience.map);
        Listeners.google.domReady(Experience.introduction[nextScreen], Listeners.introduction(Experience.introduction[nextScreen]));
      }
    });

  },

  google: {
    removedListener: function(obj) {
      google.maps.event.removeListener(obj);
    },

    domReady: function(obj, callback) {
      console.log('domReady %o', obj, callback);
      google.maps.event.addListener(obj, 'domready', callback);
    }
  }


};

// utility
Utility = {

  newMarker: function(name, pos) {
    var marker = new google.maps.Marker({
      position: pos,
      map: Experience.map
    });
    return marker;
  },

  newLatLng: function(lat, lng) {
    var pt = new google.maps.LatLng(lat,lng);
    return pt;
  },

  newMap: function(id, opts) {
    var map = new google.maps.Map(document.getElementById(id), opts);
    return map;
  },

  infoWin: {
    newWindow: function(info, pos) {
      var infowindow;
      if(pos === null) {
        infowindow = new google.maps.InfoWindow({
          content: info,
          position: Experience.startingPoint
        });
      } else {
        infowindow = new google.maps.InfoWindow({
          content: info,
          position: pos
        });
      }
      return infowindow;
    },

    openWindow: function(obj, loc) {
      obj.open(loc);
    },

    closeWindow: function(obj) {
      obj.close();
    }

  },


  createIntro: function(obj) {
    $.each(obj, function(i){
        if(this.position === null) this.position = Experience.startingPoint;
        Experience.introduction.push( Utility.infoWin.newWindow('<div class="screen" data-screen-number="'+i+'" data-type="'+this.type+'"><p>'+this.description+'</p><a href="#'+i+'" class="next">Next</a></div>', this.position));
    });

    console.log(Experience.introduction);
  }

};

// This contains all content relative to the Map Interactive experience. Each
// section contains all information, images, and videos associcated with each
// section. Sub-sections work the same as normal section and will be process
// Map-Experience.js.

// Nick Steffens <nsteffens@gmail.com>

Content = {

  introduction: {
    1: {
      description: 'Amazonia is the largest, most diverse rainforest on Earth. One tenth of the world’s plant and animal species live here—including one out of every five bird species!',
      type: 'text',
      position: null
    },

    2: {
      description: 'The vast diversity of Amazonia is currently divided into eight gigantic Areas of Endemism—regions that contain groups of plants and animals found nowhere else on Earth!',
      type: 'text',
      position: null
    },

    3: {
      description: 'Travel up Brazil’s Rio Japurá and its tributaries with our team to discover which birds live in a little-explored area where two Areas of Endemism meet—the Napo and the Imerí. <br/><br/>Documenting and studying bird populations along this boundary will help us define the range and evolutionary history of each species and better assess areas of unique diversity in need of protection.',
      type: 'text',
      position: null
    },

    4: {
      description: 'Explore the map to view Field Museum scientist Jason Weckstein’s video journals of our experiences along the way, and take a look—and listen—to the birds we found at each of at our three study sites. <br><br>You’ll learn about the fascinating feeding and breeding habits of some Amazonian species and discover how rivers may impact their evolution.',
      type: 'text',
      position: null
    },

    5: {
      type: 'markers',
      position: null,
      markers: {
        1: {
          title: 'Our Journey Begins',
          position: [1, 2],
          type: 'video',
          link: 'http://vimeopro.com/fieldmuseum/amazonian-birds/video/50315674'
        },

        2: {
          title: 'A River Village',
          position: [2, 3],
          type: 'video',
          link: 'http://vimeopro.com/fieldmuseum/amazonian-birds/video/50320303'
        },

        3: {
          title: '',
          position: [1, 2],
          type: 'video',
          link: 'http://vimeopro.com/fieldmuseum/amazonian-birds/video/50320304'
        },

        4: {
          title: 'Rio Mapari',
          position: [1,2],
          type: 'site'
        }
      }
    }

  },

  sites: {
    1: {},
    2: {},
    3: {}
  }

};