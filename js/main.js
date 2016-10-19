var w = 1280,
    h = 800;

var projection = d3.geoAlbersUsa();

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h);

var centroidPositions = [];

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var cells = svg.append("svg:g")
    .attr("id", "cells");

d3.json("data/us-states.json", function(collection) {
  states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
      .attr("d", path);
});

function sumArrayCSV(array,prop) {
  var sum = 0;
  for (i=0; i<array.length; i++) {
    sum += parseFloat(array[i][prop]);
  }
  return sum;
}

d3.csv("data/passengers-summarized.csv", function(fare) {
  var sum = sumArrayCSV(fare,'Passengers');

  // var radius = d3.scale.sqrt()
  //             .domain([0,])
});

d3.json("data/us-states-centroids.json", function(json) {

  var centroids = json.features.filter(function(centroid) {
    var location = [+centroid.geometry.coordinates[0], +centroid.geometry.coordinates[1]];
    var projectedLocation = projection(location);
    if (projectedLocation !== null) {
      centroidPositions.push(projectedLocation);
    }
  });

  circles.selectAll("circle")
    .data(json.features)
    .enter()
    .append("circle")
    .attr("r",2)
    .attr("cx", function(d, i) {
      // return centroidPositions[i][0];
      var location = projection([json.features[i].geometry.coordinates[0],json.features[i].geometry.coordinates[1]]);
      if (location !== null) {
        return location[0];
      }
    })
    .attr("cy", function(d, i) {
      var location = projection([json.features[i].geometry.coordinates[0],json.features[i].geometry.coordinates[1]]);
      if (location !== null) {
        return location[1];
      }
    });
});

// d3.csv("flights-airport.csv", function(flights) {
//   var linksByOrigin = {},
//       countByAirport = {},
//       locationByAirport = {},
//       positions = [];
//
//   var arc = d3.geo.greatArc()
//       .source(function(d) { return locationByAirport[d.source]; })
//       .target(function(d) { return locationByAirport[d.target]; });
//
//   flights.forEach(function(flight) {
//     var origin = flight.origin,
//         destination = flight.destination,
//         links = linksByOrigin[origin] || (linksByOrigin[origin] = []);
//     links.push({source: origin, target: destination});
//     countByAirport[origin] = (countByAirport[origin] || 0) + 1;
//     countByAirport[destination] = (countByAirport[destination] || 0) + 1;
//   });
//
//   d3.csv("airports.csv", function(airports) {
//
//     // Only consider airports with at least one flight.
//     airports = airports.filter(function(airport) {
//       if (countByAirport[airport.iata]) {
//         var location = [+airport.longitude, +airport.latitude];
//         locationByAirport[airport.iata] = location;
//         positions.push(projection(location));
//         return true;
//       }
//     });
//
//
//     var g = cells.selectAll("g")
//         .data(airports)
//       .enter().append("svg:g");
//
//     g.append("svg:path")
//         .attr("class", "cell")
//         .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
//         .on("mouseover", function(d, i) { d3.select("h2 span").text(d.name); });
//
//     g.selectAll("path.arc")
//         .data(function(d) { return linksByOrigin[d.iata] || []; })
//       .enter().append("svg:path")
//         .attr("class", "arc")
//         .attr("d", function(d) { return path(arc(d)); });
//
//     circles.selectAll("circle")
//         .data(airports)
//       .enter().append("svg:circle")
//         .attr("cx", function(d, i) { return positions[i][0]; })
//         .attr("cy", function(d, i) { return positions[i][1]; })
//         .attr("r", function(d, i) { return Math.sqrt(countByAirport[d.iata]); })
//         .sort(function(a, b) { return countByAirport[b.iata] - countByAirport[a.iata]; });
//   });
// });
