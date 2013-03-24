


function initialize() {
  // options
  var myLat = new google.maps.LatLng(-1.993006,-67.286072);
  var mapOptions = {
    zoom: 5,
    center: myLat,
    // UI specific stuff
    disableDefaultUI: true,
    // map type
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var introMarker = new google.maps.Marker({
    position: myLat,
    map: map,
    title: "Intro"
  });

  var introContent = '<div>'+
    '<p>Sed eget nisl sit amet.</p>'+
    '</div>';

  var introWindow = new google.maps.InfoWindow({
    content: introContent

  });

  // eventListeners
  google.maps.event.addDomListener(window, 'load', function(){
    // introWindow.open(map, introMarker);
    console.log('Map loaded');
  });

  google.maps.event.addListener(introMarker, 'click', function(){
    introWindow.open(map, introMarker);
    // console.log('Map loaded');
  });

}


// putting in script to hide token
function loadScript() {
  console.log('loadscript');
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyCxGbnLwNdfv5UzJQsK8Jgz0mhqy_sV54s&sensor=false&callback=initialize";
  document.body.appendChild(script);
}





// load map
// window.onload = loadScript;
google.maps.event.addDomListener(window, 'load', initialize);
