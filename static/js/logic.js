// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  d3.json(queryUrl2, function(data2) {
    console.log(data2);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features, data2.features);
  });
});

function getColor(d) {
	return d > 5 ? '#800026' :
	       d > 4  ? '#BD0026' :
	       d > 3  ? '#E31A1C' :
	       d > 2  ? '#FC4E2A' :
	       d > 1  ? '#FD8D3C' :
	                '#FFEDA0';
}

function createFeatures(earthquakeData, platesData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  var earthquakeCircles = [];
  // console.log(earthquakeData);
  earthquakeData.forEach( feature => {
    var location = [+feature.geometry.coordinates[1], +feature.geometry.coordinates[0]];
    // console.log(feature.properties.mag);

    earthquakeCircles.push(
      L.circle(location, {
        stroke: false,
        fillOpacity: 0.60,
        color: getColor(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        radius: (feature.properties.mag * 50000)
      }).bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time).toDateString() + "<br> Magnitude: " + feature.properties.mag + "<br> Type: " + feature.properties.type +"</p>"));
    });

  var earthquakes = L.layerGroup(earthquakeCircles);

  // function connectDots(features) {
  //   console.log(features);
  //   var c = [];
  //
  //   for (i = 0; i < features.length; i += 1) {
  //       feature = features[i];
  //       c.push(feature.geometry.coordinates);
  //   }
  //   return c;
  // }

  var plates = L.geoJSON(platesData,  {
    style: {
      color: "orange",
      weight: 1
    }
  });

  // function onEachFeature(feature, layer) {
  //   var location = [+feature.geometry.coordinates[1], +feature.geometry.coordinates[0]];
  //   L.circle(location, {
  //         fillOpacity: 0.75,
  //         color: "white",
  //         fillColor: "white",
  //         radius: (feature.properties.mag * 50000)}).bindPopup("<h3>" + feature.properties.place +
  //     "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  // }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // var earthquakes = L.geoJSON(earthquakeData, {
  //   onEachFeature: onEachFeature
  // });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [30, -10],
    zoom: 2,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //var legend = L.control({position: 'bottomright'});
  //
  // legend.onAdd = function (map) {
  //
  // 	var div = L.DomUtil.create('div', 'info legend'),
  // 		grades = [0, 10, 20, 50, 100, 200, 500, 1000],
  // 		labels = [];
  //
  // 	// loop through our density intervals and generate a label with a colored square for each interval
  // 	for (var i = 0; i < grades.length; i++) {
  // 		div.innerHTML +=
  // 			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
  // 			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  // 	}
  //
  // 	return div;
  // };
  //
  // legend.addTo(map);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FFEDA0'];
    var labels = [];

  	// loop through our density intervals and generate a label with a colored square for each interval
  	for (var i = 0; i < grades.length; i++) {
  		div.innerHTML +=
  			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
  			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  	}

  	return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}


//
// // Define variables for our base layers
// var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.streets",
//   accessToken: API_KEY
// });
//
// var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.dark",
//   accessToken: API_KEY
// });
//
// var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.light",
//   accessToken: API_KEY
// });
//
// // // Create two separate layer groups: one for cities and one for states
// // var states = L.layerGroup(stateMarkers);
// // var cities = L.layerGroup(cityMarkers);
//
// // Create a baseMaps object
// var baseMaps = {
//   "Street Map": streetmap,
//   "Dark Map": darkmap,
//   "Light Map": lightmap
// };
//
// // // Create an overlay object
// // var overlayMaps = {
// //   "State Population": states,
// //   "City Population": cities
// // };
//
// // Define a map object
// var myMap = L.map("map", {
//   center: [30, -10],
//   zoom: 2,
//   layers: lightmap
// });
//
// // // Pass our map layers into our layer control
// // // Add the layer control to the map
// // L.control.layers(baseMaps, overlayMaps, {
// //   collapsed: false
// // }).addTo(myMap);
