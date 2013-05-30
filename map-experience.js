Experience = {
  // empty vars
  introduction: [],
  markers: {
    region: [],
    sites: {
      one: [],
      two: [],
      three: []
    }
  },

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
      // map Control limitations
      zoomControl: false,
      scrollwheel: false,
      draggable: false,
      disableDoubleClickZoom: true,
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

  nextSection: function() {
    $('.next').on({
      click: function(e) {
        e.preventDefault();
        $('.sidebar .section.active').removeClass('active');
        var nextPage = parseInt($(this).attr('href'));
        $('.sidebar .section').eq(nextPage).addClass('active');

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
          $('.sidebar .section.active').removeClass('active');

          // remove overlay
          if(overlay.page < 3) overlay.setMap(null);


          // next page
          var nextPage = parseInt(overlay.page);
          $('.sidebar .section').eq(nextPage).addClass('active');

          //check for changes
          Utility.checkMapChanges($('.section').eq(nextPage));
        }

        // remove listener for overlay
        if(overlay.page === '4') {
          google.maps.event.removeListener(overlay, 'click');
        }


      });
    }
  },

  closeMediaViewer: function() {
    $('#media .close').on({
      click: function(e) {
        e.preventDefault();
        $('#media').find('.content').remove();
        $('#media').addClass('disabled');
        $('.overlay-bg').addClass('disabled');
      }
    });

    $('.overlay-bg').on({
      click: function(e) {
        e.preventDefault();
        $('#media').find('.content').remove();
        $('#media').addClass('disabled');
        $('.overlay-bg').addClass('disabled');
      }
    });
  },

  closeSpeciesViewer: function() {
    $('#species .close').on({
      click: function(e) {
        e.preventDefault();
        $("#species").addClass('disabled');
      }
    });
  },

  speciesMedia: function() {
    $('#species .video').on({
      click: function(e) {
        e.preventDefault();
        var player = Utility.getDataAttr($(this), 'player'),
            url = $(this).attr('href'),
            title = $(this).text();

        if(player === 'vimeo') {
            View.attachVimeo(url, title);
        }

      }
    });

    $('#species .audio').on({
      click: function(e) {
        e.preventDefault();
        var player = Utility.getDataAttr($(this), 'player'),
            url = $(this).attr('href'),
            title = $(this).text(),
            credit = Utility.getDataAttr($(this), 'credit');

        if($(this).hasClass('multiple') === true) title = Utility.getDataAttr($(this), 'title');

        if(player === 'html5') View.attachAudioPlayer(url, title, credit);
        if(player === 'xeno') View.attachXeno(url, title, credit);
      }
    });
  },

  backToRegion: function() {
    $('.back-to-region').on({
      click: function() {
        View.showRegion();
        // turn region overlay back on
        Experience.overlay.setMap(Experience.map);
        // remove site overlay
        Experience.siteOverlay = null;
      }
    });
  },

  siteVideo: function(obj) {
    $('.site-video').removeClass('disabled');
    $('.site-video').on({
      click: function() {
        if(obj.player === 'vimeo') {
          View.attachVimeo(obj.video, obj.title);
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
          page = Utility.getDataAttr($(this), 'page'),
          content = $(this).clone();

      // add section to map-overlay
      $sidebar.append(content);

    });

    $sidebar.find('.section:first-child').addClass('active');
    // check intro 1 for map properties
    Utility.checkMapChanges($sidebar.children().first());
    // attach Listener
    Controllers.nextSection();

  },

  createSite: function(obj) {
    View.emptySidebar();
    // hide legend
    $('.legend').addClass("disabled");

    var $overlay = $('.sidebar .content'),
        content = obj.clone(),
        markers = obj.find('.marker').clone();

    // populate text area
    $overlay.append(content);
    $overlay.find('.section:first-child').addClass('active');
    // createMarkers
    View.siteMarkers(markers);

    // create siteVideo off the obj dataSet
    var siteVideo = {
      video: Utility.getDataAttr(obj, 'site-video-url'),
      player: Utility.getDataAttr(obj, 'site-video-player'),
      title: Utility.getDataAttr(obj, 'site-video-title')
    };

    Controllers.siteVideo(siteVideo);
    // update map
    Utility.checkMapChanges(obj);
  },

  siteMarkers: function(arr) {
    $.each(arr, function(){

      var name = Utility.getDataAttr($(this), 'title');
          pos = Utility.getDataAttr($(this), 'position'),
          site = Utility.getDataAttr($(this), 'site');

          img = Utility.getDataAttr($(this), 'marker-image');
          pos = pos.split(',');
          pos = Utility.newLatLng(pos[0], pos[1]);

      //creates marker
      var marker = Utility.newMarker(name, pos, img);

      // push to global
      switch (site) {
        case '1':
          Experience.markers.sites.one.push(marker);
        break;
        case '2':
          Experience.markers.sites.two.push(marker);
        break;
        case '3':
          Experience.markers.sites.three.push(marker);
        break;
        default:
        // do nothing
      }
      // sets listeners
      Controllers.google.clickMarker(marker);

    });
  },

  species: function(obj) {
    View.createSpeciesViewer();
    // append to Species Viewer
    var content = obj.clone();
    $('#species.overlay').append(content);
    $('#species.overlay').removeClass('disabled');
    Controllers.speciesMedia();
    Controllers.closeSpeciesViewer();
  },

  createSpeciesViewer: function() {
    $('#species.overlay .content').remove();
  },

  zoomMap: function(lvl) {
    if(typeof lvl == 'string') lvl = parseInt(lvl);
    Experience.map.setZoom(lvl);
  },

  changeMapCenter: function(location) {
    Experience.map.setCenter(location);
  },

  createMediaViewer: function(credit) {
    $('#media .content').remove();
    $('#media .credit').empty().text(credit);
    $('#media').removeClass('disabled');
    $('.overlay-bg').removeClass('disabled');
    // add Listener
    Controllers.closeMediaViewer();
  },

  attachVimeo: function(url, name) {

    View.createMediaViewer();
    var id = url.split('video/'),
        videoId = id[1],
        player = '<div class="content"><h2 class="font-blue">'+name+'</h2><iframe class="video-player" src="http://player.vimeo.com/video/'+videoId+'?autoplay=true" width="618" height="412" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>';

    $('#media').append(player);

  },

  // XENO AUDIO
  attachXeno: function(url, name, credit) {
    View.createMediaViewer(credit);
    var id = url.split('http://www.xeno-canto.org/');
        id = id[1];

    var player = '<div class="content"><h2 class="font-blue">'+name+'</h2><iframe class="xeno-player" src="http://www.xeno-canto.org/embed.php?XC='+id+'" scrolling="no" frameborder="0" width="500" height="210"></iframe></div>';
    $('#media').append(player);
  },

  // HTML 5
  attachAudioPlayer: function(url, name, credit) {
    View.createMediaViewer(credit);
    var player = '<div class="content"><h2 class="font-blue">'+name+'</h2><audio controls autoplay>'+
                    '<source src="'+url+'">'+
                    'Your Browser doesn\'t support the audio element.'+
                  '</audio></div>';
    $('#media').append(player);
  },

  showRegion: function() {
    View.hideSites();
    View.emptySidebar();

    // hide back2 button
    $('.back-to-region').addClass('disabled');
    // hide site-video button
    $('.site-video').addClass('disabled');

    // show region markers
    $.each(Experience.markers.region, function() {
      this.setMap(Experience.map);
    });

    var content = $('#intro .section[data-page="4"]').clone();

    // show region content
    $('.sidebar .content').append(content);
    $('.content .section').first().addClass('active');

    Utility.checkMapChanges($('.content .section.active'));

  },

  hideSites: function() {
    $.each(Experience.markers.sites, function() {
      // get all points
      $.each(this, function(){
        this.setMap(null);
      });
    });

    // clears out site markers
    Experience.markers.sites = {
      one: [],
      two: [],
      three: []
    };
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

  newMarker: function(name, pos, img) {
    var marker = new google.maps.Marker({
      position: pos,
      map: Experience.map,
      title: name,
      icon: 'images/'+img
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
            pos = Utility.getDataAttr($(this), 'position'),
            img = Utility.getDataAttr($(this), 'marker-image'),
            section = Utility.getDataAttr(obj, 'section');
        pos = pos.split(',');
        pos = Utility.newLatLng(pos[0], pos[1]);

        //creates marker
        var marker = Utility.newMarker(name, pos, img);

        // pushes to global marker array
        switch (section) {
          case 'intro':
            Experience.markers.region.push(marker);
          break;
          case 'site1':
            Experience.markers.sites.one.push(marker);
          break;
          case 'site2':
            Experience.markers.sites.two.push(marker);
          break;
          case 'site2':
            Experience.markers.sites.three.push(marker);
          break;
          default:
          // do nothing
        }

        // sets listener
        Controllers.google.clickMarker(marker);

      });
    }

    // check for overlay
    if(obj.attr('data-type') === 'overlay') {
      // remove Current Overlay
      if( Experience.overlay !== undefined) Experience.overlay.setMap(null);

      var overlayImage = 'images/' + Utility.getDataAttr(obj, 'overlay'),
          swBound = Utility.getDataAttr(obj, 'swBound'),
          neBound = Utility.getDataAttr(obj, 'neBound');

      swBound = swBound.split(',');
      neBound = neBound.split(',');

      swBound = Utility.newLatLng(swBound[0], swBound[1]);
      neBound = Utility.newLatLng(neBound[0], neBound[1]);

      var bounds = new google.maps.LatLngBounds(swBound, neBound);

      if(obj.attr('id') === undefined ) {

        Experience.overlay = new google.maps.GroundOverlay(overlayImage, bounds, {page: obj.attr('data-page'), section: obj.attr('data-section')});
        Experience.overlay.setMap(Experience.map);

        Controllers.google.clickOverlay(Experience.overlay);

      } else {
        Experience.siteOverlay = new google.maps.GroundOverlay(overlayImage, bounds, {page: obj.attr('data-page'), section: obj.attr('data-section')});

        Experience.siteOverlay.setMap(Experience.map);

      }

    }

    // legend
    if(obj.attr('data-type') === 'show-legend') $('.legend').removeClass('disabled');

    // map type
    if(obj.attr('data-map-type')) {
      Experience.map.setMapTypeId(Utility.getDataAttr(obj, 'map-type'));
    }
  },

  marker: {

    getAction: function(id) {
      var marker = $('.info .marker[data-title="'+id+'"]'),
          type = Utility.getDataAttr(marker, 'marker-type');

      switch (type) {
        case 'video':
          var video = Utility.getDataAttr(marker, 'url'),
              player = Utility.getDataAttr(marker, 'video-player'),
              title = Utility.getDataAttr(marker, 'title');
          if(player === 'vimeo') {
            View.attachVimeo(video, title);
          }
        break;
        case 'site':
          var siteId = Utility.getDataAttr(marker, 'site-id');
          View.createSite($('#'+siteId));

          // hide intro markers
          $.each(Experience.markers.region, function(){
            this.setMap(null);
          });

          $('.back-to-region').removeClass('disabled');


          Experience.overlay.setMap(null);

          Controllers.backToRegion();


        break;
        case 'species':
          View.species(marker);
        break;
        default:
        // nothing
      }
    }
  }

};
