// arcs and tooltips
// dc-js.github.io/dc.js

var w = 980,
    h = 600;

// var projection = d3.geo.albersUsa()
//                  .scale(w);

var hoverBgColor = '#a5a5a5';
var defaultBgColor = '#cccccc';
var clickBgColor = '#777';

// var path = d3.geo.path()
//     .projection(projection);

var svg = d3.select("#map").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h);

var centroidPositions = [];

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var arcsLayer;
var arcData;

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
var centroidsHash = {};

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


// Date.daysBetween = function( date1, date2 ) {
//   //Get 1 day in milliseconds
//   var one_day=1000*60*60*24;

//   // Convert both dates to milliseconds
//   var date1_ms = date1.getTime();
//   var date2_ms = date2.getTime();

//   // Calculate the difference in milliseconds
//   var difference_ms = date2_ms - date1_ms;

//   // Convert back to days and return
//   return Math.round(difference_ms/one_day);
// }

Date.quartersBetweenInDays = function( date1, date2 ) {
  if (date2 > date1) {
    var dateInYears = [ date1.getFullYear(), date2.getFullYear() ];
    var dateInQuarters = [ Math.floor((date1.getMonth())/3)+1, Math.floor((date2.getMonth())/3)+1 ];
    // console.log(dateInQuarters);
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


function getLinksLatLng(arr,fromState) {
  // input fromState code, eg. "CA"
  var links = [];
  var linksLatLng = [];
  for (i=0; i<arr.length; i++) {
    if (arr[i][0] === fromState) {
      links.push([arr[i][0], arr[i][1]]);
    }
  }
  // d3.json("data/us-states-centroids.json", function(centroids) {
  //   console.log(centroids);
  // });
  for (j=0; j<links.length; j++) {
    var sourceTargetObj = {};
    var sourceCoord = centroidsHash[links[j][0]];
    var targetCoord = centroidsHash[links[j][1]];
    sourceTargetObj.source_lat = sourceCoord[1];
    sourceTargetObj.source_lng = sourceCoord[0];
    sourceTargetObj.target_lat = targetCoord[1];
    sourceTargetObj.target_lng = targetCoord[0];
    sourceTargetObj.sourceLocation = [sourceTargetObj.source_lng,sourceTargetObj.source_lat]
    sourceTargetObj.targetLocation = [sourceTargetObj.target_lng,sourceTargetObj.target_lat];
    linksLatLng.push(sourceTargetObj);
  }
  return linksLatLng;
}

var arcs = {
  bake: function(layer){
    // Remove all exisiting arcs
    if (arcsLayer) layer.selectAll('.arcs').remove();

    // Group for the arcs
    arcsLayer = layer.append('g')
        .attr('class','arcs');

    // We're going to have an arc and a circle point, so let's make a separate group for those items to keep things organized
    var arc_group = arcsLayer.selectAll('.great-arc-group')
        .data(arcData).enter()
          .append('g')
          .classed('great-arc-group', true);

    // In each group, create a path for each source/target pair.
    arc_group.append('path')
      .attr('d', function(d) {
        return arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 2); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
      });

    // And a circle for each end point
    arc_group.append('circle')
        .attr('r', 2)
        .classed('great-arc-end', true)
        .attr("transform", function(d) {
          return "translate(" + arcs.lngLatToPoint(d.targetLocation) + ")";
        });

  },
  lngLatToArc: function(d, sourceName, targetName, bend){
    // If no bend is supplied, then do the plain square root
    bend = bend || 1;

    // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
    // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`
    var sourceLngLat = d[sourceName],
        targetLngLat = d[targetName];

    if (targetLngLat && sourceLngLat) {
      var sourceXY = projection( sourceLngLat ),
          targetXY = projection( targetLngLat );

      // Comment this out for production, useful to see if you have any null lng/lat values
      // if (!targetXY) console.log(d, targetLngLat, targetXY)
      var sourceX = sourceXY[0],
          sourceY = sourceXY[1];

      var targetX = targetXY[0],
          targetY = targetXY[1];

      var dx = targetX - sourceX,
          dy = targetY - sourceY,
          dr = Math.sqrt(dx * dx + dy * dy)*bend;

      // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
      var west_of_source = (targetX - sourceX) < 0;
      if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
      return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

    } else {
      return "M0,0,l0,0z";
    }
  },
  lngLatToPoint: function(location_array){
    // Our projection function handles the conversion between lng/lat pairs and svg space
    // But we put this wrapper around it to handle the even of any empty rows
    if (location_array) {
      return projection(location_array);
    } else {
      return '0,0';
    }
  }
};

// d3.json("data/us-states.json", function(collection) {
//   var passengersHash;
//   var fareHash;
//   var passengersArr;
//   d3.csv("data/fare-passengers-summarized.csv", function(data) {
//     // console.log(data);
//     // var radius = d3.scale.sqrt()
//     //             .domain([0,]

//     //needs input from crossfilter
//     passengersArr = statesSumArrByTime(data, 'Passengers', dateArr[0], dateArr[1]);
//     passengersHash = arrToHash(passengersArr);
//     // console.log(passengersHash);
//     var fareArr = statesAvgArrByTime(data, 'Avg. Fare', dateArr[0], dateArr[1]);
//     // console.log(fareArr);
//     fareHash = arrToHash(fareArr);
//   });

//   states.selectAll("path")
//     .data(collection.features)
//     .enter()
//     .append("svg:path")
//     .attr("d", path)
//     .attr("clicked", "false")
//     .on("mouseover", function(d) {
//       if (!clickedEle(this)) {
//         d3.select(this)
//         .style("fill", hoverBgColor);
//       }

//       if (chosenStateFrom) {
//         chosenStateTo = getKeyByValue(statesHash, d.properties.name);
//         var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
//         var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
//         fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare)*100)/100 : "-";
//         passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)): "-";
//         updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
//                   + fareDisplay + ", Total Passengers: " + passengersDisplay);
//       }
//     })

//     .on("mouseout", function(d) {
//       if (!clickedEle(this)) {
//         d3.select(this)
//         .style("fill", defaultBgColor);
//       };
//       if (chosenStateFrom) {
//         chosenStateTo = getKeyByValue(statesHash, d.properties.name);
//         updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
//                   + fareDisplay + ", Total Passengers: " + passengersDisplay);
//       }
//     })

//     .on("click", function(d) {
//       // reset all fills
//       states.selectAll("path")
//         .attr("clicked", "false")
//         .style("fill", defaultBgColor);

//       // set click status and fill
//       d3.select(this)
//         .attr("clicked", "true")
//         .style("fill", clickBgColor);

//       chosenStateFrom = getKeyByValue(statesHash, d.properties.name);
//       var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
//       var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
//       fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare)*100)/100 : "-";
//       passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)): "-";
//       arcData = getLinksLatLng(passengersArr, chosenStateFrom);
//       arcs.bake(svg);
//       updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: "
//                   + fareDisplay + ", Total Passengers: " + passengersDisplay);
//     });
// });


// d3.json("data/us-states-centroids.json", function(json) {

//   var centroids = json.features.filter(function(centroid) {
//     // console.log(centroid);
//     var stateName = centroid.properties.name;
//     var stateCode = getKeyByValue(statesHash,stateName);
//     var stateCoordinates = centroid.geometry.coordinates;
//     var location = [+centroid.geometry.coordinates[0], +centroid.geometry.coordinates[1]];
//     var projectedLocation = projection(location);
//     if (projectedLocation !== null) {
//       centroidPositions.push(projectedLocation);
//     }
//     centroidsHash[stateCode] = stateCoordinates;
//   });
// });

// d3.csv("flights-airport.csv", function(flights) {
//   var linksByOrigin = {},
//       countByAirport = {},
//       locationByAirport = {},
//       positions = [];

//   var arc = d3.geo.greatArc()
//       .source(function(d) { return locationByAirport[d.source]; })
//       .target(function(d) { return locationByAirport[d.target]; });

//   flights.forEach(function(flight) {
//     var origin = flight.origin,
//         destination = flight.destination,
//         links = linksByOrigin[origin] || (linksByOrigin[origin] = []);
//     links.push({source: origin, target: destination});
//     countByAirport[origin] = (countByAirport[origin] || 0) + 1;
//     countByAirport[destination] = (countByAirport[destination] || 0) + 1;
//   });

//   d3.csv("airports.csv", function(airports) {

//     // Only consider airports with at least one flight.
//     airports = airports.filter(function(airport) {
//       if (countByAirport[airport.iata]) {
//         var location = [+airport.longitude, +airport.latitude];
//         locationByAirport[airport.iata] = location;
//         positions.push(projection(location));
//         return true;
//       }
//     });


//     var g = cells.selectAll("g")
//         .data(airports)
//       .enter().append("svg:g");

//     g.append("svg:path")
//         .attr("class", "cell")
//         .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
//         .on("mouseover", function(d, i) { d3.select("h2 span").text(d.name); });

//     g.selectAll("path.arc")
//         .data(function(d) { return linksByOrigin[d.iata] || []; })
//       .enter().append("svg:path")
//         .attr("class", "arc")
//         .attr("d", function(d) { return path(arc(d)); });

//     circles.selectAll("circle")
//         .data(airports)
//       .enter().append("svg:circle")
//         .attr("cx", function(d, i) { return positions[i][0]; })
//         .attr("cy", function(d, i) { return positions[i][1]; })
//         .attr("r", function(d, i) { return Math.sqrt(countByAirport[d.iata]); })
//         .sort(function(a, b) { return countByAirport[b.iata] - countByAirport[a.iata]; });
//   });
// });
var flightsByDate,
		flightsByOriginAiports,
		passengersByOriginAirports,
		flightsByDestAirports,
		passengersByDestAirports,
    OriDestAirportsGroup;

var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 8]);

// var path = d3.geo.path().projection(d3.geo.albersUsa());

function JSONtoGeoJSON(json, latName, lngName, property) {

};

var gfx = {
	viz: {
		draw: function(layer){
			gfx.baseMap.bake(layer);
			gfx.airports.bake(layer);
			// gfx.arcs.bake(layer);
		}
	},
	baseMap: {
		setValues: function(){
			// These values are shared among all instances of our basemap
			// Map dimensions (in pixels)
			this.width = 900;
			this.height = 600;

			// Map projection
			this.projection = d3.geo.albersUsa()
					.scale(this.width)
					.translate([this.width/2, this.height/2]); //translate to center the map in view

			// Generate paths based on projection
			this.path = d3.geo.path()
					.projection(this.projection);

		},
		bake: function(layer){
			this[layer] = {};
			// Create an SVG
			this[layer].svg = d3.select('.map-container[data-contains="'+layer+'"]').append('svg')
					.attr('width', this.width)
					.attr('height', this.height);

			// Keeps track of currently zoomed feature
			this[layer].centered;

			this[layer].states = this[layer].svg.append('g')
					.attr('class','states');
			//Create a path for each map feature in the data
			this[layer].states.selectAll('path')
				.data(data.baseMapGeometry.features) //
				.enter()
				.append('path')
				.attr('d', this.path);
				// .on('click', function(d,i) { gfx.baseMap.zoom(d,i,layer) });
		},
		zoom: function(d,i,layer){
			//Add any other onClick events here
			var x, y, k;

			if (d && gfx.baseMap[layer].centered !== d) {
		    // Compute the new map center and scale to zoom to
				var centroid = gfx.baseMap.path.centroid(d);
				var b = gfx.baseMap.path.bounds(d);
				x = centroid[0];
				y = centroid[1];
				k = .8 / Math.max((b[1][0] - b[0][0]) / gfx.baseMap.width, (b[1][1] - b[0][1]) / gfx.baseMap.height);
				gfx.baseMap[layer].centered = d
			} else {
				x = gfx.baseMap.width / 2;
				y = gfx.baseMap.height / 2;
				k = 1;
				gfx.baseMap[layer].centered = null;
			}

			// Highlight the new feature
			gfx.baseMap[layer].states.selectAll("path")
				.classed("highlighted",function(d) {
						return d === gfx.baseMap[layer].centered;
				})
				.style("stroke-width", 1 / k + "px"); // Keep the border width constant

			//Zoom and re-center the whole map container
			//Comment `.transition()` and `.duration()` to eliminate gradual zoom
			gfx.baseMap[layer].svg
				.transition()
				.duration(500)
				.attr("transform","translate(" + gfx.baseMap.width / 2 + "," + gfx.baseMap.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
		}
	},
	arcs: {
		bake: function(layer){
			// Group for the arcs
			gfx.baseMap[layer].arcs = gfx.baseMap[layer].svg.append('g')
					.attr('class','arcs');

			// We're going to have an arc and a circle point, so let's make a separate group for those items to keep things organized
			var arc_group = gfx.baseMap[layer].arcs.selectAll('.great-arc-group')
					.data(data.arcs).enter()
						.append('g')
						.classed('great-arc-group', true);

			// In each group, create a path for each source/target pair.
			arc_group.append('path')
				.attr('d', function(d) {
					// console.log(d)
					return gfx.arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 15); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
				});

			// And a circle for each end point
			// arc_group.append('circle')
			// 		.attr('r', 2)
			// 		.classed('great-arc-end', true)
			// 	  .attr("transform", function(d) {
			// 	    return "translate(" + gfx.arcs.lngLatToPoint(d.targetLocation) + ")";
			// 	  });

		},
		lngLatToArc: function(d, sourceName, targetName, bend){
			// If no bend is supplied, then do the plain square root
			bend = bend || 1;

			// `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
			// Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`
			var sourceLngLat = d[sourceName],
					targetLngLat = d[targetName];

			if (targetLngLat && sourceLngLat) {
				var sourceXY = gfx.baseMap.projection( sourceLngLat ),
						targetXY = gfx.baseMap.projection( targetLngLat );

				// Comment this out for production, useful to see if you have any null lng/lat values
				if (!targetXY) console.log(d, targetLngLat, targetXY)
				var sourceX = sourceXY[0],
						sourceY = sourceXY[1];

				var targetX = targetXY[0],
						targetY = targetXY[1];

				var dx = targetX - sourceX,
						dy = targetY - sourceY,
						dr = Math.sqrt(dx * dx + dy * dy)*bend;

				// To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
				var west_of_source = (targetX - sourceX) < 0;
				if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
				return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

			} else {
				return "M0,0,l0,0z";
			}
		},
		lngLatToPoint: function(location_array){
			// Our projection function handles the conversion between lng/lat pairs and svg space
			// But we put this wrapper around it to handle the even of any empty rows
			if (location_array) {
				return gfx.baseMap.projection(location_array);
			} else {
				return '0,0';
			}
		},
		transform: {
			locationifyArcCsv: function(arcs){
				// Our csv has location stored as separate columns
				// We need to turn those columns into arrays
				// And, importantly, we need to convert the values from strings, which the csv probably sees them as into numbers
				// We can do this conversion (referred to as "casting") by putting a `+` before the value.
				arcs.forEach(function(arc){
					arc.sourceLocation = [+arc.source_lng, +arc.source_lat];
					arc.targetLocation = [+arc.target_lng, +arc.target_lat];
				});
				return arcs;
			}
		}
	},
	airports: {
		bake: function(layer) {
			// Group for the airport symbols
			gfx.baseMap[layer].airports = gfx.baseMap[layer].svg.append('g')
					.attr('class','airports');

			// combine the airport data with incoming/outgoing flight data
			var airportData = data.airports;
			var passengersByOriginAirportsData = passengersByOriginAirports.all();
			var outgoingPassengersHash = {};
			for (i = 0; i < passengersByOriginAirportsData.length; i++) {
				var airportID = passengersByOriginAirportsData[i].key;
				var passengers = passengersByOriginAirportsData[i].value;
				outgoingPassengersHash[airportID] = passengers;
			}
			// add outgoingPassengers to airportData
			airportData.features.forEach(function(airport) {
				// console.log(airport);
				var outPassengers = outgoingPassengersHash[airport.properties.airportID];
				if (outPassengers) {
					airport.properties.outgoingPassengers = outPassengers;
				}
				return airport;
			});
			gfx.baseMap[layer].airports.selectAll(".airports")
				.data(airportData.features)
			.enter()
				.append("path")
				.attr("class", "airport")
				.attr("d", gfx.baseMap.path.pointRadius(function(d) {
          return (typeof d.properties.outgoingPassengers != 'undefined') ? radius(d.properties.outgoingPassengers) : 0;
				}));
		}
	}
}

var onDone = {
	initViz: function(){
		gfx.baseMap.setValues();
		gfx.viz.draw('main');
	}
}

var data = {
	load: {
		baseMap: function(callback){
			d3.json('data/us-states.json', function(error, baseMapGeometry){
				if (error) return console.log(error); // Unknown error, check the console
				// Store the geodata on the data object for reference later
				data.baseMapGeometry = baseMapGeometry;
				callback();
			});
		},
		flights: function(callback){
			d3.csv('data/2016-flights.csv', function(error, flights){
				if (error) return console.log(error); // Unknown error, check the console
				// Store flights on the data object for reference later
				data.flights = crossfilter(data.transform.addDate(flights));
				flightsByDate = data.flights.dimension(function(d) {return d.date});
				flightsByOriginAiports = data.flights.dimension(function(d) {return d['ORIGIN_AIRPORT_ID']});
				passengersByOriginAirports = flightsByOriginAiports.group().reduceSum(function(d) {
					return d['PASSENGERS'];
				});
				flightsByDestAirports = data.flights.dimension(function(d) {return d['DEST_AIRPORT_ID']});
				passengersByDestAirports = flightsByDestAirports.group().reduceSum(function(d) {
					return d['PASSENGERS'];
				});
        var OriDestAirportsDimension = data.flights.dimension(function(d) {
          //stringify() and later, parse() to get keyed objects
          return JSON.stringify ( { originID: d["ORIGIN_AIRPORT_ID"], destID: d["DEST_AIRPORT_ID"] } ) ;
        });
        // console.log(OriDestAirportsDimension);
        OriDestAirportsGroup = OriDestAirportsDimension.group().reduceSum(function(d) {
          return d['PASSENGERS'];
        });
        OriDestAirportsGroup.all().forEach(function(d) {
          d.key = JSON.parse(d.key);
        });
        console.log(OriDestAirportsGroup.all());
				callback();
			});
		},
		airports: function(callback) {
			d3.json('data/us-airports.json', function(error, airports) {
				if (error) return console.log(error);
				// store airports on data object for reference later
				data.airports = airports;
				callback();
			})
		}
	},
	transform: {
		addDate: function(arr) {
			arr.forEach(function(obj){
				var date = new Date(obj.YEAR,obj.MONTH);
				obj.date = date;
			});
			return arr;
		}
	}
}

var init = {
	go: function(){
		// Instead of loading the data through this callback situation
		// You could use queue.js and wait for all of them to be done.
		// But there's enough going on here for one tutorial.
		data.load.baseMap(function(){
			data.load.flights(function(){
				data.load.airports(onDone.initViz);
			});
		});
	}
}

init.go();
// Things to do:
// figure out arcs thingy
// add circles that correspond to incoming and outgoing flights