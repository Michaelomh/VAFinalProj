// arcs and tooltips
// dc-js.github.io/dc.js

var w = 980,
    h = 600;

var projection = d3.geoAlbersUsa()
                 .scale(w);

var hoverBgColor = '#E98333';
var defaultBgColor = '#cccccc';
var clickBgColor = '#D96531';

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

var display = svg.append("text")
                .attr("x", 130)
                .attr("y", h-60)
                .attr("class", "legend")
                .style("fill", "black")
                .text("Select a state");

var chosenStateFrom = "";
var chosenStateTo = "";
var passengersDisplay;
var fareDisplay;


// sample date (please insert later) = [startDate, endDate] CROSS FILTER INPUT **********
var dateArr = [new Date(2010, 0, 1), new Date(2015, 10, 30)];


///// Utility Functions

function searchHash(key1, key2, hash) {
  var keyToFind = key1 + key2;
  return hash[keyToFind];
}

function getKeyByValue(obj,value) {
  for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}

function updateText(svg,text) {
  svg.text(text);
}

function currentColor(svg) {
  return rgb2hex(d3.select(svg).style("fill"));
}

function clickedEle(svg) {
  return d3.select(svg).attr("clicked") === "true" ;
}

function arrToHash(arr) {
  var objHash = {};
  for (i=0;i<arr.length;i++) {
    var hashKey = arr[i][0] + arr[i][1];
    objHash[hashKey] = arr[i][2];
  }
  return objHash;
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

Date.daysBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;

  // Convert back to days and return
  return Math.round(difference_ms/one_day);
}

Date.quartersBetweenInDays = function( date1, date2 ) {
  if (date2 > date1) {
    var dateInYears = [ date1.getFullYear(), date2.getFullYear() ];
    var dateInQuarters = [ Math.floor((date1.getMonth())/3)+1, Math.floor((date2.getMonth())/3)+1 ];
    console.log(dateInQuarters);
    var yearsDiff = dateInYears[1] - dateInYears[0];
    if (yearsDiff === 0) {
      return ( Math.abs(dateInQuarters[0] - dateInQuarters[1]) + 1 ) * 91;
    } else {
      return (yearsDiff-1)*365 + (Math.abs(dateInQuarters[0]-5) + dateInQuarters[1])*91;
    }
  } else {
    throw date1 + " has to be less than " + date2;
  }
}

// DO I NEED TO CHANGE THE WAY I SUM? CURRENTLY I JUST ADD ALL TOGETHER. SHOULD I DIVIDE & MULTIPLY BY TOTAL DAYS?
function statesSumArrByTime(array, prop, dateStart, dateEnd) {
  var sum = parseFloat(array[0][prop]);
  var arr = [];
  var statesParsed = [array[0]['State-from'], array[0]['State-to']];
  var daysBetween = Date.quartersBetweenInDays(dateStart, dateEnd);

  // array has to be sorted by states-from, states-to
  for (i=1; i<array.length; i++) {
    var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
    if ((dateStart <= currentDate) && (dateEnd >= currentDate )) {
      var statesCurrent = [array[i]['State-from'], array[i]['State-to']];

      if (statesCurrent.toString() !== statesParsed.toString()) {
        var currentStateArr = statesParsed.slice(0);
        currentStateArr.push(sum);
        arr.push(currentStateArr);
        statesParsed = statesCurrent;
        sum = parseFloat(array[i][prop]);
      } else {
        sum += parseFloat(array[i][prop]);
      }
    }
  }
  return arr;
  // should return [[state-from, state-to, sum],[],...]
}

function statesAvgArrByTime(array, prop, dateStart, dateEnd) {
  var sumArr = [parseFloat(array[0][prop])];
  var arr = [];
  var statesParsed = [array[0]['State-from'], array[0]['State-to']];

  // array has to be sorted by states-from, states-to

  for (i=1; i<array.length; i++) {
    var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
    if ((dateStart <= currentDate) && (dateEnd >= currentDate )) {
      var statesCurrent = [array[i]['State-from'], array[i]['State-to']];

      if (statesCurrent.toString() !== statesParsed.toString()) {
        var currentStateArr = statesParsed.slice(0);
        var sumArrLength = sumArr.length;
        var avg = sumArr.reduce(function(a,b) {
                        return a + b;
                      }, 0) / sumArrLength;
        currentStateArr.push(avg);
        arr.push(currentStateArr);
        statesParsed = statesCurrent;
        sumArr = [parseFloat(array[i][prop])];
      } else {
        sumArr.push(parseFloat(array[i][prop]));
      }
    }
  }
  return arr;
  // should return [[state-from, state-to, avg],[],...]
}





d3.json("data/us-states.json", function(collection) {
  var passengersHash;
  var fareHash;
  d3.csv("data/passengers-summarized.csv", function(data) {

    // var radius = d3.scale.sqrt()
    //             .domain([0,]

    //needs input from crossfilter
    var passengersArr = statesSumArrByTime(data, 'Passengers', dateArr[0], dateArr[1]);
    // console.log(passengersArr);
    passengersHash = arrToHash(passengersArr);
    // console.log(passengersHash);
  });

  d3.csv("data/fare-summarized.csv", function(data) {

    // var radius = d3.scale.sqrt()
    //             .domain([0,]

    //needs input from crossfilter
    var fareArr = statesAvgArrByTime(data, 'Avg. Fare', dateArr[0], dateArr[1]);
    // console.log(fareArr);
    fareHash = arrToHash(fareArr);
  });

  states.selectAll("path")
    .data(collection.features)
    .enter()
    .append("svg:path")
    .attr("d", path)
    .attr("clicked", "false")
    .on("mouseover", function(d) {
      if (!clickedEle(this)) {
        d3.select(this)
        .style("fill", hoverBgColor);
      }

      if (chosenStateFrom) {
        chosenStateTo = getKeyByValue(statesHash, d.properties.name);
        var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
        var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
        fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare)*100)/100 : "-";
        passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)): "-";
        updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
                  + fareDisplay + ", Total Passengers: " + passengersDisplay);
      }
    })

    .on("mouseout", function(d) {
      if (!clickedEle(this)) {
        d3.select(this)
        .style("fill", defaultBgColor);
      };
      if (chosenStateFrom) {
        chosenStateTo = getKeyByValue(statesHash, d.properties.name);
        updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
                  + fareDisplay + ", Total Passengers: " + passengersDisplay);
      }
    })

    .on("click", function(d) {
      states.selectAll("path")
        .attr("clicked", "false")
        .style("fill", defaultBgColor);

      d3.select(this)
        .attr("clicked", "true")
        .style("fill", clickBgColor);
      chosenStateFrom = getKeyByValue(statesHash, d.properties.name);
      var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
      var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
      fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare)*100)/100 : "-";
      passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)): "-";
      updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
                  + fareDisplay + ", Total Passengers: " + passengersDisplay);
    });
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
