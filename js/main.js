// arcs and tooltips
// dc-js.github.io/dc.js

var w = 980,
    h = 600;

var projection = d3.geo.albersUsa()
    .scale(w);

var hoverBgColor = '#a5a5a5';
var defaultBgColor = '#cccccc';
var clickBgColor = '#777';

// var path = d3.geo.path()
//     .projection(projection);

// var svg = d3.select("#map").insert("svg:svg", "h2")
//     .attr("width", w)
//     .attr("height", h);

// var centroidPositions = [];

// var states = svg.append("svg:g")
//     .attr("id", "states");

// var circles = svg.append("svg:g")
//     .attr("id", "circles");

// var arcsLayer;
// var arcData;

// var cells = svg.append("svg:g")
//     .attr("id", "cells");

// var display = svg.append("text")
//                 .attr("x", 130)
//                 .attr("y", h-60)
//                 .attr("class", "legend")
//                 .style("fill", "black")
//                 .text("Select a state");


var display = svg.append("text")
    .attr("x", 130)
    .attr("y", h - 60)
    .attr("class", "legend")
    .style("fill", "black")
    .text("Select a state");

// var chosenStateFrom = "";
// var chosenStateTo = "";
// var passengersDisplay;
// var fareDisplay;
// var centroidsHash = {};


// // sample date (please insert later) = [startDate, endDate] CROSS FILTER INPUT **********
// var dateArr = [new Date(2010, 0, 1), new Date(2015, 10, 30)];


// ///// Utility Functions

// function searchHash(key1, key2, hash) {
//   var keyToFind = key1 + key2;
//   return hash[keyToFind];
// }


///// Utility Functions

function searchHash(key1, key2, hash) {
    var keyToFind = key1 + key2;
    return hash[keyToFind];
}

function getKeyByValue(obj, value) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop] === value)
                return prop;
        }
    }
}

function updateText(svg, text) {
    svg.text(text);
}

function currentColor(svg) {
    return rgb2hex(d3.select(svg).style("fill"));
}

function clickedEle(svg) {
    return d3.select(svg).attr("clicked") === "true";
}

function arrToHash(arr) {
    var objHash = {};
    for (i = 0; i < arr.length; i++) {
        var hashKey = arr[i][0] + arr[i][1];
        objHash[hashKey] = arr[i][2];
    }
    return objHash;
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

// function getKeyByValue(obj,value) {
//   for( var prop in obj ) {
//         if( obj.hasOwnProperty( prop ) ) {
//              if( obj[ prop ] === value )
//                  return prop;
//         }
//     }
// }

// function updateText(svg,text) {
//   svg.text(text);
// }

// function currentColor(svg) {
//   return rgb2hex(d3.select(svg).style("fill"));
// }

// function clickedEle(svg) {
//   return d3.select(svg).attr("clicked") === "true" ;
// }

// function arrToHash(arr) {
//   var objHash = {};
//   for (i=0;i<arr.length;i++) {
//     var hashKey = arr[i][0] + arr[i][1];
//     objHash[hashKey] = arr[i][2];
//   }
//   return objHash;
// }

// function rgb2hex(rgb){
//  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
//  return (rgb && rgb.length === 4) ? "#" +
//   ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
//   ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
//   ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
// }

// // Date.daysBetween = function( date1, date2 ) {
// //   //Get 1 day in milliseconds
// //   var one_day=1000*60*60*24;

// //   // Convert both dates to milliseconds
// //   var date1_ms = date1.getTime();
// //   var date2_ms = date2.getTime();

// //   // Calculate the difference in milliseconds
// //   var difference_ms = date2_ms - date1_ms;

// //   // Convert back to days and return
// //   return Math.round(difference_ms/one_day);
// // }

// Date.quartersBetweenInDays = function( date1, date2 ) {
//   if (date2 > date1) {
//     var dateInYears = [ date1.getFullYear(), date2.getFullYear() ];
//     var dateInQuarters = [ Math.floor((date1.getMonth())/3)+1, Math.floor((date2.getMonth())/3)+1 ];
//     // console.log(dateInQuarters);
//     var yearsDiff = dateInYears[1] - dateInYears[0];
//     if (yearsDiff === 0) {
//       return ( Math.abs(dateInQuarters[0] - dateInQuarters[1]) + 1 ) * 91;
//     } else {
//       return (yearsDiff-1)*365 + (Math.abs(dateInQuarters[0]-5) + dateInQuarters[1])*91;
//     }
//   } else {
//     throw date1 + " has to be less than " + date2;
//   }
// }

// // DO I NEED TO CHANGE THE WAY I SUM? CURRENTLY I JUST ADD ALL TOGETHER. SHOULD I DIVIDE & MULTIPLY BY TOTAL DAYS?
// function statesSumArrByTime(array, prop, dateStart, dateEnd) {
//   var sum = parseFloat(array[0][prop]);
//   var arr = [];
//   var statesParsed = [array[0]['State-from'], array[0]['State-to']];
//   var daysBetween = Date.quartersBetweenInDays(dateStart, dateEnd);

//   // array has to be sorted by states-from, states-to
//   for (i=1; i<array.length; i++) {
//     var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
//     if ((dateStart <= currentDate) && (dateEnd >= currentDate )) {
//       var statesCurrent = [array[i]['State-from'], array[i]['State-to']];

//       if (statesCurrent.toString() !== statesParsed.toString()) {
//         var currentStateArr = statesParsed.slice(0);
//         currentStateArr.push(sum);
//         arr.push(currentStateArr);
//         statesParsed = statesCurrent;
//         sum = parseFloat(array[i][prop]);
//       } else {
//         sum += parseFloat(array[i][prop]);
//       }
//     }
//   }
//   return arr;
//   // should return [[state-from, state-to, sum],[],...]
// }

// function statesAvgArrByTime(array, prop, dateStart, dateEnd) {
//   var sumArr = [parseFloat(array[0][prop])];
//   var arr = [];
//   var statesParsed = [array[0]['State-from'], array[0]['State-to']];

//   // array has to be sorted by states-from, states-to

//   for (i=1; i<array.length; i++) {
//     var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
//     if ((dateStart <= currentDate) && (dateEnd >= currentDate )) {
//       var statesCurrent = [array[i]['State-from'], array[i]['State-to']];

//       if (statesCurrent.toString() !== statesParsed.toString()) {
//         var currentStateArr = statesParsed.slice(0);
//         var sumArrLength = sumArr.length;
//         var avg = sumArr.reduce(function(a,b) {
//                         return a + b;
//                       }, 0) / sumArrLength;
//         currentStateArr.push(avg);
//         arr.push(currentStateArr);
//         statesParsed = statesCurrent;
//         sumArr = [parseFloat(array[i][prop])];
//       } else {
//         sumArr.push(parseFloat(array[i][prop]));
//       }
//     }
//   }
//   return arr;
//   // should return [[state-from, state-to, avg],[],...]
// }


// function getLinksLatLng(arr,fromState) {
//   // input fromState code, eg. "CA"
//   var links = [];
//   var linksLatLng = [];
//   for (i=0; i<arr.length; i++) {
//     if (arr[i][0] === fromState) {
//       links.push([arr[i][0], arr[i][1]]);
//     }
//   }
//   // d3.json("data/us-states-centroids.json", function(centroids) {
//   //   console.log(centroids);
//   // });
//   for (j=0; j<links.length; j++) {
//     var sourceTargetObj = {};
//     var sourceCoord = centroidsHash[links[j][0]];
//     var targetCoord = centroidsHash[links[j][1]];
//     sourceTargetObj.source_lat = sourceCoord[1];
//     sourceTargetObj.source_lng = sourceCoord[0];
//     sourceTargetObj.target_lat = targetCoord[1];
//     sourceTargetObj.target_lng = targetCoord[0];
//     sourceTargetObj.sourceLocation = [sourceTargetObj.source_lng,sourceTargetObj.source_lat]
//     sourceTargetObj.targetLocation = [sourceTargetObj.target_lng,sourceTargetObj.target_lat];
//     linksLatLng.push(sourceTargetObj);
//   }
//   return linksLatLng;
// }


Date.quartersBetweenInDays = function (date1, date2) {
    if (date2 > date1) {
        var dateInYears = [date1.getFullYear(), date2.getFullYear()];
        var dateInQuarters = [Math.floor((date1.getMonth()) / 3) + 1, Math.floor((date2.getMonth()) / 3) + 1];
        // console.log(dateInQuarters);
        var yearsDiff = dateInYears[1] - dateInYears[0];
        if (yearsDiff === 0) {
            return (Math.abs(dateInQuarters[0] - dateInQuarters[1]) + 1) * 91;
        } else {
            return (yearsDiff - 1) * 365 + (Math.abs(dateInQuarters[0] - 5) + dateInQuarters[1]) * 91;
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
    for (i = 1; i < array.length; i++) {
        var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
        if ((dateStart <= currentDate) && (dateEnd >= currentDate)) {
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

    for (i = 1; i < array.length; i++) {
        var currentDate = new Date(array[i]['Year'], array[i]['Month'], array[i]['Day']);
        if ((dateStart <= currentDate) && (dateEnd >= currentDate)) {
            var statesCurrent = [array[i]['State-from'], array[i]['State-to']];

            if (statesCurrent.toString() !== statesParsed.toString()) {
                var currentStateArr = statesParsed.slice(0);
                var sumArrLength = sumArr.length;
                var avg = sumArr.reduce(function (a, b) {
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


function getLinksLatLng(arr, fromState) {
    // input fromState code, eg. "CA"
    var links = [];
    var linksLatLng = [];
    for (i = 0; i < arr.length; i++) {
        if (arr[i][0] === fromState) {
            links.push([arr[i][0], arr[i][1]]);
        }
    }
    // d3.json("data/us-states-centroids.json", function(centroids) {
    //   console.log(centroids);
    // });

    for (j = 0; j < links.length; j++) {
        var sourceTargetObj = {};
        var sourceCoord = centroidsHash[links[j][0]];
        var targetCoord = centroidsHash[links[j][1]];
        sourceTargetObj.source_lat = sourceCoord[1];
        sourceTargetObj.source_lng = sourceCoord[0];
        sourceTargetObj.target_lat = targetCoord[1];
        sourceTargetObj.target_lng = targetCoord[0];
        sourceTargetObj.sourceLocation = [sourceTargetObj.source_lng, sourceTargetObj.source_lat]
        sourceTargetObj.targetLocation = [sourceTargetObj.target_lng, sourceTargetObj.target_lat];
        linksLatLng.push(sourceTargetObj);
    }
    return linksLatLng;
}

var arcs = {
    bake: function () {
        // Remove all exisiting arcs
        if (arcsLayer) svg.selectAll('.arcs').remove();

        // Group for the arcs
        arcsLayer = svg.append('g')
            .attr('class', 'arcs');

        // We're going to have an arc and a circle point, so let's make a separate group for those items to keep things organized
        var arc_group = arcsLayer.selectAll('.great-arc-group')
            .data(arcData).enter()
            .append('g')
            .classed('great-arc-group', true);

        // In each group, create a path for each source/target pair.
        arc_group.append('path')
            .attr('d', function (d) {
                return arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 2); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
            });

        // And a circle for each end point
        arc_group.append('circle')
            .attr('r', 2)
            .classed('great-arc-end', true)
            .attr("transform", function (d) {
                return "translate(" + arcs.lngLatToPoint(d.targetLocation) + ")";
            });

    },
    lngLatToArc: function (d, sourceName, targetName, bend) {
        // If no bend is supplied, then do the plain square root
        bend = bend || 1;

        // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
        // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`
        var sourceLngLat = d[sourceName],
            targetLngLat = d[targetName];

        if (targetLngLat && sourceLngLat) {
            var sourceXY = projection(sourceLngLat),
                targetXY = projection(targetLngLat);

            // Comment this out for production, useful to see if you have any null lng/lat values
            // if (!targetXY) console.log(d, targetLngLat, targetXY)
            var sourceX = sourceXY[0],
                sourceY = sourceXY[1];

            var targetX = targetXY[0],
                targetY = targetXY[1];

            var dx = targetX - sourceX,
                dy = targetY - sourceY,
                dr = Math.sqrt(dx * dx + dy * dy) * bend;

            // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
            var west_of_source = (targetX - sourceX) < 0;
            if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

        } else {
            return "M0,0,l0,0z";
        }
    },
    lngLatToPoint: function (location_array) {
        // Our projection function handles the conversion between lng/lat pairs and svg space
        // But we put this wrapper around it to handle the even of any empty rows
        if (location_array) {
            return projection(location_array);
        } else {
            return '0,0';
        }
    }
};


d3.json("data/us-states.json", function (collection) {
    var passengersHash;
    var fareHash;
    var passengersArr;
    d3.csv("data/passengers-summarized.csv", function (data) {
        // console.log(data);
        // var radius = d3.scale.sqrt()
        //             .domain([0,]

        //needs input from crossfilter
        passengersArr = statesSumArrByTime(data, 'Passengers', dateArr[0], dateArr[1]);
        passengersHash = arrToHash(passengersArr);
        // console.log(passengersHash);
    });

    d3.csv("data/fare-summarized.csv", function (data) {

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
        .on("mouseover", function (d) {
            if (!clickedEle(this)) {
                d3.select(this)
                    .style("fill", hoverBgColor);
            }

            if (chosenStateFrom) {
                chosenStateTo = getKeyByValue(statesHash, d.properties.name);
                var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
                var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
                fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare) * 100) / 100 : "-";
                passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)) : "-";
                updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: " + fareDisplay + ", Total Passengers: " + passengersDisplay);
            }
        })

    .on("mouseout", function (d) {
        if (!clickedEle(this)) {
            d3.select(this)
                .style("fill", defaultBgColor);
        };
        if (chosenStateFrom) {
            chosenStateTo = getKeyByValue(statesHash, d.properties.name);
            updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: " + fareDisplay + ", Total Passengers: " + passengersDisplay);
        }
    })

    .on("click", function (d) {
        // reset all fills
        states.selectAll("path")
            .attr("clicked", "false")
            .style("fill", defaultBgColor);

        // set click status and fill
        d3.select(this)
            .attr("clicked", "true")
            .style("fill", clickBgColor);

        chosenStateFrom = getKeyByValue(statesHash, d.properties.name);
        var currentAvgFare = searchHash(chosenStateFrom, chosenStateTo, fareHash);
        var currentSumPassengers = searchHash(chosenStateFrom, chosenStateTo, passengersHash);
        fareDisplay = currentAvgFare ? "$" + Math.round(parseFloat(currentAvgFare) * 100) / 100 : "-";
        passengersDisplay = currentSumPassengers ? Math.round(parseFloat(currentSumPassengers)) : "-";
        arcData = getLinksLatLng(passengersArr, chosenStateFrom);
        console.log(arcData);
        arcs.bake();
        updateText(display, "From " + chosenStateFrom + ' to ' + chosenStateTo + ", Avg Fare: " + fareDisplay + ", Total Passengers: " + passengersDisplay);
    });
});


d3.json("data/us-states-centroids.json", function (json) {

    var centroids = json.features.filter(function (centroid) {
        // console.log(centroid);
        var stateName = centroid.properties.name;
        var stateCode = getKeyByValue(statesHash, stateName);
        var stateCoordinates = centroid.geometry.coordinates;
        var location = [+centroid.geometry.coordinates[0], +centroid.geometry.coordinates[1]];
        var projectedLocation = projection(location);
        if (projectedLocation !== null) {
            centroidPositions.push(projectedLocation);
        }
        centroidsHash[stateCode] = stateCoordinates;
    });

    // circles.selectAll("circle")
    //   .data(json.features)
    //   .enter()
    //   .append("circle")
    //   .attr("r",2)
    //   .attr("cx", function(d, i) {
    //     // return centroidPositions[i][0];
    //     var location = projection([json.features[i].geometry.coordinates[0],json.features[i].geometry.coordinates[1]]);
    //     if (location !== null) {
    //       return location[0];
    //     }
    //   })
    //   .attr("cy", function(d, i) {
    //     var location = projection([json.features[i].geometry.coordinates[0],json.features[i].geometry.coordinates[1]]);
    //     if (location !== null) {
    //       return location[1];
    //     }
    //   });
});

// var arcs = {
//   bake: function(layer){
//     // Remove all exisiting arcs
//     if (arcsLayer) layer.selectAll('.arcs').remove();

//     // Group for the arcs
//     arcsLayer = layer.append('g')
//         .attr('class','arcs');

//     // We're going to have an arc and a circle point, so let's make a separate group for those items to keep things organized
//     var arc_group = arcsLayer.selectAll('.great-arc-group')
//         .data(arcData).enter()
//           .append('g')
//           .classed('great-arc-group', true);

//     // In each group, create a path for each source/target pair.
//     arc_group.append('path')
//       .attr('d', function(d) {
//         return arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 2); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
//       });

//     // And a circle for each end point
//     arc_group.append('circle')
//         .attr('r', 2)
//         .classed('great-arc-end', true)
//         .attr("transform", function(d) {
//           return "translate(" + arcs.lngLatToPoint(d.targetLocation) + ")";
//         });

//   },
//   lngLatToArc: function(d, sourceName, targetName, bend){
//     // If no bend is supplied, then do the plain square root
//     bend = bend || 1;

//     // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
//     // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`
//     var sourceLngLat = d[sourceName],
//         targetLngLat = d[targetName];

//     if (targetLngLat && sourceLngLat) {
//       var sourceXY = projection( sourceLngLat ),
//           targetXY = projection( targetLngLat );

//       // Comment this out for production, useful to see if you have any null lng/lat values
//       // if (!targetXY) console.log(d, targetLngLat, targetXY)
//       var sourceX = sourceXY[0],
//           sourceY = sourceXY[1];

//       var targetX = targetXY[0],
//           targetY = targetXY[1];

//       var dx = targetX - sourceX,
//           dy = targetY - sourceY,
//           dr = Math.sqrt(dx * dx + dy * dy)*bend;

//       // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
//       var west_of_source = (targetX - sourceX) < 0;
//       if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
//       return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

//     } else {
//       return "M0,0,l0,0z";
//     }
//   },
//   lngLatToPoint: function(location_array){
//     // Our projection function handles the conversion between lng/lat pairs and svg space
//     // But we put this wrapper around it to handle the even of any empty rows
//     if (location_array) {
//       return projection(location_array);
//     } else {
//       return '0,0';
//     }
//   }
// };


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


function intervalTreeGroup(tree, firstDate, lastDate) {
    return {
        all: function () {
            var begin = d3.time.month(firstDate),
                end = d3.time.month(lastDate);
            var i = new Date(begin);
            var ret = [],
                count;
            do {
                next = new Date(i);
                next.setMonth(next.getMonth() + 1);
                count = 0;
                tree.queryInterval(i.getTime(), next.getTime(), function () {
                    ++count;
                });
                ret.push({
                    key: i,
                    value: count
                });
                i = next;
            }
            while (i.getTime() <= end.getTime());
            return ret;
        }
    };
}
var timeFormat = d3.time.format('%x');
var monthChart = dc.barChart("#month");
var costChart = dc.barChart("#cost");
// data from http://stackoverflow.com/questions/22603788/crossfilter-how-to-extract-time-information-from-start-date-and-end-date-column
d3.csv("data/intervals.csv", function (error, projects) {

    projects.forEach(function (x) {
        x['Start Date'] = timeFormat.parse(x['Start Date']);
        x['End Date'] = timeFormat.parse(x['End Date']);
        // the library uses object identity so we have to cache the interval arrays
        x.interval = [x['Start Date'].getTime(), x['End Date'].getTime()];
        x.Cost = +x.Cost;
    });
    // the interval tree library doesn't seem to provide start/end info
    var firstDate = d3.min(projects, function (x) {
            return x['Start Date'];
        }),
        lastDate = d3.max(projects, function (x) {
            return x['End Date'];
        });

    var ndx = crossfilter(projects),
        intervalDimension = ndx.dimension(function (d) {
            return d.interval;
        }),
        projectsPerMonthTree = ndx.groupAll().reduce(
            function (v, d) {
                v.insert(d.interval);
                return v;
            },
            function (v, d) {
                v.remove(d.interval);
                return v;
            },
            function () {
                return lysenkoIntervalTree(null);
            }
        ),
        projectsPerMonthGroup = intervalTreeGroup(projectsPerMonthTree.value(), firstDate, lastDate),
        projectCostDimension = ndx.dimension(function (d) {
            return d.Cost;
        }),
        projectCostGroup = projectCostDimension.group();

    monthChart
        .width(900)
        .height(300)
        .x(d3.time.scale())
        /*          .y(d3.scale.linear().domain([0,25]))*/
        .xUnits(d3.time.months)
        .gap(5)
        .elasticX(true)
        .brushOn(true)
        /*          .yAxisLabel("Number of Projects")*/
        /*.xAxisLabel("Month")*/
        .dimension(intervalDimension)
        .group(projectsPerMonthGroup)
        .controlsUseVisibility(true);

    monthChart.filterHandler(function (dim, filters) {
        if (filters && filters.length) {
            if (filters.length !== 1)
                throw new Error('not expecting more than one range filter');
            var range = filters[0];
            getQuarter(range[0], range[1]);
            dim.filterFunction(function (i) {
                return !(i[1] < range[0].getTime() || i[0] > range[1].getTime());
            })
        } else dim.filterAll();
        return filters;
    });


    costChart
        .width(400)
        .height(300)
        .x(d3.scale.linear().domain([0, 24]))
        .y(d3.scale.linear().domain([0, 25]))
        .brushOn(true)
        .yAxisLabel("Number of Projects")
        .xAxisLabel("Cost")
        .dimension(projectCostDimension)
        .group(projectCostGroup)
        .controlsUseVisibility(true);

    dc.renderAll();
});

function getQuarter(startDate, endDate) {
    var startYear = startDate.getFullYear();
    var startMonth = startDate.getMonth();
    var endYear = endDate.getFullYear();
    var endMonth = endDate.getMonth();
    console.log(startMonth);
    console.log(endMonth);
    var startQuarter = convertNumberIntoQuarter(startMonth);
    var endQuarter = convertNumberIntoQuarter(endMonth);

    $("#quarterValues").text("You have selected between " + startQuarter + " " + startYear + " till " + endQuarter + " " + endYear + ".");
}

function convertNumberIntoQuarter(month) {
    console.log("month = " + month);
    var toReturn = "";

    switch (month) {
    case 0:
        toReturn = "Q1"
        break;
    case 1:
        toReturn = "Q1"
        break;
    case 2:
        toReturn = "Q1"
        break;
    case 3:
        toReturn = "Q2"
        break;
    case 4:
        toReturn = "Q2"
        break;
    case 5:
        toReturn = "Q2"
        break;
    case 6:
        toReturn = "Q3"
        break;
    case 7:
        toReturn = "Q3"
        break;
    case 8:
        toReturn = "Q3"
        break;
    case 9:
        toReturn = "Q4"
        break;
    case 10:
        toReturn = "Q4"
        break;
    case 11:
        toReturn = "Q4"
        break;
    default:
        toReturn = "ERROR"
        break;
    }

    return toReturn;
}


var usChart = dc.geoChoroplethChart("#usChart");
var colorScale = ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"];
var numberFormat = d3.format(".2f");

d3.csv("data/fare-passengers-summarized.csv", function(csv) {
  var data = crossfilter(csv);

  var stateFrom = data.dimension(function(d) {
    return d["State-from-full"];
  });

  var stateFromPassengersSum = stateFrom.group().reduceSum(function(d) {
    return d["Passengers"];
  });

  var stateLinks = data.dimension(function(d) {
    return 'stateFrom=' + d["State-from"] + '; stateTo=' + d["State-to"];
  });

  var stateLinksPassengers = stateLinks.group().reduceSum(function(d) {
    return d["Passengers"].all();
  });
  var passengers = data.dimension(function(d) {
    return d["Passengers"];
  });

  d3.json("data/us-states.json", function(statesJson) {

  usChart.width(990)
         .height(500)
         .dimension(stateFrom)
         .group(stateFromPassengersSum)
         .colors(d3.scale
                   .quantize()
                   .domain([50000,300000000]) //segmenting can be improved
                   .range(colorScale))
         .colorCalculator(function (d) { return d ? usChart.colors()(d) : '#ccc'; })
         .overlayGeoJson(statesJson.features, "state", function (d) {
            return d.properties.name;
         })
         .title(function(d) {
           return "State: " + d.key + "\nTotal Passengers Departure: " + numberFormat(d.value ? d.value/1000000 : 0) + "M";
         });

  dc.renderAll();
  });
});
