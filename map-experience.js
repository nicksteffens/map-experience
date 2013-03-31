Experience = {
  // empty vars
  introduction: [],

  // initialize
  initialize: function() {
    Experience.setVars();
    Experience.createIntro();
    // Utility.debug();
  },

  setVars: function() {
    // set starting point
    var initialPos = Utility.getDataAttr($('#intro'), 'position');
    initialPos = initialPos.split(',');
    Experience.startingPoint = Utility.newLatLng(initialPos[0], initialPos[1]);

    // set options
    Experience.mapOptions = {
      zoom: parseInt(Utility.getDataAttr($('#intro'), 'zoom')),
      center: Experience.startingPoint,
      // UI specific stuff
      disableDefaultUI: true,
      // map type
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    // create map
    Experience.map = Utility.newMap('map-canvas', Experience.mapOptions);
  },

  createIntro: function() {
    var $intro = $('#intro'),
        $section = $intro.children('.section');

    // makes array of DOM elements
    $section = $section.toArray();

    View.overlayContent($section);

  }

};


// eventListeners
Controllers = {
  // closeOverlay: function(){
  //   $('#closeOverlay').on({
  //     click: function(e) {
  //       e.preventDefault();
  //       View.removeOverlay();
  //     }
  //   });

  // },

  nextSection: function() {
    $('.next').on({
      click: function(e) {
        e.preventDefault();
        $('.section.active').removeClass('active');
        var nextPage = parseInt($(this).attr('href').slice('1'));
        $('.section').eq(nextPage).addClass('active');

        Utility.checkMapChanges($('.section').eq(nextPage));

      }
    });
  },

  google: {
    clickMarker: function(marker) {
      google.maps.event.addListener(marker, 'click', function() {
        Utility.marker.getAction(marker.title);
      });
    },

    clickOverlay: function(overlay) {
      google.maps.event.addListener(overlay, 'click', function() {

        if(overlay.page !== '4' && overlay.section === 'intro') {
          // hide current
          $('.section.active').removeClass('active');

          // remove overlay
          overlay.setMap(null);

          // next page
          var nextPage = parseInt(overlay.page);
          $('.section').eq(nextPage).addClass('active');

          //check for changes
          Utility.checkMapChanges($('.section').eq(nextPage));
        }


      });
    }
  },

  closeMediaViewer: function() {
    $('#media-viewer .close').on({
      click: function(e) {
        e.preventDefault();
        $('#media-viewer').remove();
      }
    });
  },

  closeSpeciesViewer: function() {
    $('#species-viewer .close').on({
      click: function(e) {
        e.preventDefault();
        $('#species-viewer').remove();
      }
    });
  },

  speciesMedia: function() {
    $('#species-viewer .media a').on({
      click: function(e) {
        e.preventDefault();
        var type = $(this).attr('class'),
            player = Utility.getDataAttr($(this), 'player'),
            url = $(this).attr('href');

        switch (type) {
          case 'audio':
            if(player === 'html5') View.attachAudioPlayer(url);
            if(player === 'xeno') View.attachXeno(url);
          break;
          case 'video':
            if(player === 'vimeo') View.attachVimeo(url);
          break;
          default:
          // nothing
        }
      }
    });
  }

};

// END Of controllers

// View
View = {

  emptySidebar: function() {
    $('.sidebar .content').empty();
  },

  removeOverlay: function() {
    $('#map-overlay').remove();
  },

  overlayContent: function(arr) {
    View.emptySidebar();
    var $sidebar = $('.sidebar .content');
    $.each(arr, function(){
      var section = Utility.getDataAttr($(this), 'section'),
          page = Utility.getDataAttr($(this), 'page');

      // add section to map-overlay
      $sidebar.append($(this));

      switch (section) {
        case 'intro':
          $(this).append('<a href="#'+page+'" title="next" class="next intro">Continue</a>');
        break;
        default:
      }

    });
    //show first child
    $sidebar.children().first().addClass('active');

    // check intro 1 for map properties
    Utility.checkMapChanges($sidebar.children().first());
    // attach Listener
    Controllers.nextSection();

  },

  createSite: function(obj) {
    View.createOverlay();
    var $overlay = $('#overlay-content'),
        description = obj.children('.description'),
        markers = obj.find('.marker');

    // populate text area
    $overlay.append(description);

    // createMarkers
    View.siteMarkers(markers);


    // update map
    Utility.checkMapChanges(obj);
  },

  siteMarkers: function(arr) {
    $.each(arr, function(){

       var name = $(this).find('h2').text();
            pos = Utility.getDataAttr($(this), 'position');
        pos = pos.split(',');
        pos = Utility.newLatLng(pos[0], pos[1]);
        //creates marker
        var marker = Utility.newMarker(name, pos);

        // sets listener
        Controllers.google.clickMarker(marker);
    });
  },

  species: function(obj) {
    View.createSpeciesViewer();
    // append to Species Viewer
    $('#species-viewer').append(obj);
    Controllers.speciesMedia();
  },

  createSpeciesViewer: function() {
    $("#species-viewer").remove();
    var viewer = '<div id="species-viewer"><a href="#" class="close" title="close">CLOSE</a></div>';
    $('.canvas').append(viewer);
    Controllers.closeSpeciesViewer();

  },

  zoomMap: function(lvl) {
    if(typeof lvl == 'string') lvl = parseInt(lvl);
    Experience.map.setZoom(lvl);
  },

  changeMapCenter: function(location) {
    Experience.map.setCenter(location);
  },

  createMediaViewer: function() {
    if($('#media-viewer').length < 1) {
      var viewer = '<div id="media-viewer"><a href="#" class="close" title="close">CLOSE</a></div>';
      $('.canvas').append(viewer);
      Controllers.closeMediaViewer();
    } else {
      $('#media-viewer').empty();
    }
  },

  attachVimeo: function(url) {
    View.createMediaViewer();
    var id = url.split('video/'),
        videoId = id[1],
        player = '<iframe src="http://player.vimeo.com/video/'+videoId+'" width="870" height="370" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

    $('#media-viewer').append(player);

  },

  attachXeno: function(id) {
    View.createMediaViewer();
    var player = '<iframe src="http://www.xeno-canto.org/embed.php?XC='+id+'&simple=1" scrolling="no" frameborder="0" width="170" height="58"></iframe>';
    $('#media-viewer').append(player);
  },

  attachAudioPlayer: function(url) {
    View.createMediaViewer();
    var player = '<audio controls>'+
                    '<source src="'+url+'">'+
                    'Your Browser doesn\'t support the audio element.'+
                  '</audio>';
    $('#media-viewer').append(player);
  }
};
// END of VIEW

// utility
Utility = {

  newMap: function(id, opts) {
    var map = new google.maps.Map(document.getElementById(id), opts);
    return map;
  },

  newLatLng: function(lat, lng) {
    var pt = new google.maps.LatLng(lat,lng);
    return pt;
  },

  newMarker: function(name, pos) {
    var marker = new google.maps.Marker({
      position: pos,
      map: Experience.map,
      title: name
    });
    return marker;
  },

  getDataAttr: function(obj, str) {
    var dataAttr = obj.attr('data-'+str);
    return dataAttr;
  },

  checkMapChanges: function(obj) {
    // check for position
    if(obj.attr('data-position') !== undefined) {
      var pos = Utility.getDataAttr(obj, 'position');
      pos = pos.split(',');
      var location = Utility.newLatLng(pos[0], pos[1]);
      View.changeMapCenter(location);
    }

    // check for zoom
    if(obj.attr('data-zoom') !== undefined) {
      var zoom = Utility.getDataAttr(obj, 'zoom');
      View.zoomMap(zoom);
    }

    // check of markers
    if(obj.attr('data-markers') === 'true') {

      $.each(obj.find('.marker'), function(){
        var name = Utility.getDataAttr($(this), 'title'),
            pos = Utility.getDataAttr($(this), 'position');
        pos = pos.split(',');
        pos = Utility.newLatLng(pos[0], pos[1]);
        //creates marker
        var marker = Utility.newMarker(name, pos);

        // sets listener
        Controllers.google.clickMarker(marker);

      });
    }

    // check for overlay
    if(obj.attr('data-type') === 'overlay') {

      var overlayImage = 'images/' + Utility.getDataAttr(obj, 'overlay'),
          swBound = Utility.getDataAttr(obj, 'swBound'),
          neBound = Utility.getDataAttr(obj, 'neBound');

      swBound = swBound.split(',');
      neBound = neBound.split(',');

      swBound = Utility.newLatLng(swBound[0], swBound[1]);
      neBound = Utility.newLatLng(neBound[0], neBound[1]);

      var bounds = new google.maps.LatLngBounds(swBound, neBound);
      var overlay = new google.maps.GroundOverlay(overlayImage, bounds, {page: obj.attr('data-page'), section: obj.attr('data-section')});
      overlay.setMap(Experience.map);

      Controllers.google.clickOverlay(overlay);

    }
  },

  marker: {

    getAction: function(id) {
      var marker = $('.marker[data-title="'+id+'"]'),
          type = Utility.getDataAttr(marker, 'marker-type');

      switch (type) {
        case 'video':
          var video = Utility.getDataAttr(marker, 'url'),
              player = Utility.getDataAttr(marker, 'video-player');
          if(player === 'vimeo') View.attachVimeo(video);
        break;
        case 'site':
          var siteId = Utility.getDataAttr(marker, 'site-id');
          View.createSite($('#'+siteId));
        break;
        case 'species':
          View.species(marker);
        break;
        default:
        // nothing
      }
    }
  },

  debug: function() {
    $('.debugger').children('button').on('click', function(e) {
      var task = $(this).attr('class');

      switch (task)
        {
          case 'show-overlay':
            View.createOverlay();
          break;

          case 'close-overlay':
            View.removeOverlay();
          break;

          case 'reset':
            window.location.reload();
          break;

          case 'addMarker':
            var testMarker = Utility.newMarker('test', Utility.newLatLng(-1.834293,-66.440472));
          break;

          default:
          // do nothing
        }
    });
  }

};
