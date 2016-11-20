// sample month (please insert later) = [startMonth, endMonth] CROSS FILTER INPUT **********
var monthArr = [1,12];

var flightsByDate,
		flightsByOriginAiports,
		passengersByOriginAirports,
		flightsByDestAirports,
		passengersByDestAirports,
    OriDestAirportsGroup;

var numberFormat = d3.formatPrefix('.2', 1e6);

var arcNumberFormat = d3.format(',');

var arcsData = [];

var airportLocationHash = {};
var airportNameHash = {};

var radius = d3.scaleSqrt()
    .domain([0, 5e6])
    .range([0, 15]);

var arcScale = d3.scaleLinear()
               .domain([0,100000])
               .range([0,3]);

// var path = d3.geo.path().projection(d3.geo.albersUsa());

// function JSONtoGeoJSON(json, latName, lngName, property) {

// };

// input array of originID, destID, value and hash of airports
function airportsToLngLat(arr, hash) {
  for (i=0; i<arr.length; i++) {
    var originID = arr[i].key.originID;
    var destID = arr[i].key.destID;
    var value = arr[i].value;

    var objToPush = {};
    objToPush.sourceLocation = hash[originID];
    objToPush.targetLocation = hash[destID];
    objToPush.passengers = value;
    objToPush.originID = originID;
    objToPush.destID = destID;
    arcsData.push(objToPush);
  }
  // console.log(arcsData);
}

var gfx = {
	viz: {
		draw: function(layer){
			gfx.baseMap.bake(layer);
      gfx.arcs.bake(layer);
			gfx.airports.bake(layer);
			gfx.airportTooltip.bake(layer);
			gfx.arcTooltip.bake(layer);
		},
		redraw: function(layer) {
			d3.select(".arcs").remove();
			d3.select(".airports").remove();
			d3.select(".airport-legend").remove();
			gfx.arcs.bake(layer);
			gfx.airports.bake(layer);
		}
	},
	baseMap: {
		setValues: function(){
			// These values are shared among all instances of our basemap
			// Map dimensions (in pixels)
			this.width = 1024;
			this.height = 600;

			// Map projection
			this.projection = d3.geoAlbersUsa()
					.scale(this.width*1)
					.translate([this.width/2+100, this.height/2]); //translate to center the map in view

			// Generate paths based on projection
			this.path = d3.geoPath()
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
				.data(data.baseMapGeometry.features)
				.enter()
				.append('path')
				.attr('d', this.path);
		}
	},
	arcs: {
		bake: function(layer){
			// Group for the arcs
			gfx.baseMap[layer].arcs = gfx.baseMap[layer].svg.append('g')
					.attr('class','arcs');

			flightsByMonth.filter(monthArr[0] !== monthArr[1] ? monthArr : monthArr[0]); // INPUT NEEDED FROM SLIDER HERE

			passengersByOriginAirports = flightsByOriginAiports.group().reduceSum(function(d) {
				return d['PASSENGERS'];
			});

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

      airportsToLngLat(OriDestAirportsGroup.all(), airportLocationHash);
			// We're going to have an arc and a circle point, so let's make a separate group for those items to keep things organized

			// console.log('arcsData', arcsData);
			var arc_group = gfx.baseMap[layer].arcs.selectAll('.great-arc-group')
					.data(arcsData).enter()
						.append('g')
						.classed('great-arc-group', true)
		        .attr('oriAirport', function(d) { return d.originID; })
        		.attr('destAirport', function(d) { return d.destID; });

			// In each group, create a path for each source/target pair.
			arc_group.append('path')
				.attr('d', function(d) {
					// console.log(d)
					return gfx.arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 5); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
				})
        .attr('stroke-width', function(d) {
          // console.log(d.passengers);
          return arcScale(d.passengers);
        }).on("mouseover", function(d) {
				gfx.baseMap[layer].arcTooltip.transition()
					.duration(200)
					.style("opacity", .8);
				gfx.baseMap[layer].arcTooltip.html(
						'<p class="arc-name">From ' + airportNameHash[d.originID] + "</br>" + "To " + airportNameHash[d.destID] + "</p>" +
						"Passengers: " + arcNumberFormat(d.passengers) )
	        .style("left", (d3.event.pageX + 15) + "px")
	        .style("top", (d3.event.pageY - 28) + "px");
				}).on("mouseout", function(d) {
		      gfx.baseMap[layer].arcTooltip.transition()
		      	.duration(500)
		        .style("opacity", 0);
		    });

		  arcsData = [];

			arc_group.exit().remove();
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
				// if (!targetXY) console.log("target not in projection", d, targetLngLat, targetXY)

        if (targetXY && sourceXY) {
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
        }

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

      var passengersByDestAirportsData = passengersByDestAirports.all();
      var incomingPassengersHash = {};

			for (i = 0; i < passengersByOriginAirportsData.length; i++) {
				var airportID = passengersByOriginAirportsData[i].key;
				var passengers = passengersByOriginAirportsData[i].value;
				outgoingPassengersHash[airportID] = passengers;
			}

      for (i = 0; i < passengersByDestAirportsData.length; i++) {
        var airportID = passengersByDestAirportsData[i].key;
        var passengers = passengersByDestAirportsData[i].value;
        incomingPassengersHash[airportID] = passengers;
      }

			// add outgoingPassengers and incomingPassengers to airportData
			data.airports.features.forEach(function(airport) {
				// console.log(airport);
        var airportID = airport.properties.airportID;
				var outPassengers = outgoingPassengersHash[airportID];
        var inPassengers = incomingPassengersHash[airportID];
				if (outPassengers) {
					airport.properties.outgoingPassengers = outPassengers;
				}
        if (inPassengers) {
          airport.properties.incomingPassengers = inPassengers;
        }
				return airport;
			});
      //add symbols for outgoing passsengers
			var airports = gfx.baseMap[layer].airports.selectAll(".airports")
				.data(data.airports.features)
			.enter()
				.append("path")
				.attr("class", "airport")
				.attr("d", gfx.baseMap.path.pointRadius(function(d) {
          return (typeof d.properties.outgoingPassengers != 'undefined') ? radius(d.properties.outgoingPassengers) : 0;
				}))
				.on("click", function(d) {
					// toggle visiblity of lines
					var airportID = d.properties.airportID;
					$( ".great-arc-group[oriAirport="+ airportID +"] path" ).toggle();
					// toggle class to change fill
					d3.select(this).classed("selected", !d3.select(this).classed("selected"));
				}).on("mouseover", function(d) {
					gfx.baseMap[layer].airportTooltip.transition()
						.duration(200)
						.style("opacity", .8);
					gfx.baseMap[layer].airportTooltip.html(
							'<p class="airport-name">' + d.properties.displayAirportName + "</p>" +
							'Outgoing Passengers: ' + numberFormat(d.properties.outgoingPassengers) + "<br/>" +
							'Incoming Passengers: ' + numberFormat(d.properties.incomingPassengers))
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
				}).on("mouseout", function(d) {
          gfx.baseMap[layer].airportTooltip.transition()
          	.duration(500)
            .style("opacity", 0);
        });

    	airports.exit().remove();

      // add legend

      gfx.baseMap[layer].legend = gfx.baseMap[layer].svg.append('g')
        .attr("class", "airport-legend")
        .attr("transform", "translate("+ (gfx.baseMap.width - 320) +",20)");

      var airportLegend = d3.legendSize()
        .scale(radius)
        .shape('circle')
        .shapePadding(40)
        .labelOffset(20)
        .labelFormat(numberFormat)
        .orient('horizontal');

      gfx.baseMap[layer].svg.select(".airport-legend")
        .call(airportLegend);
		}
	},
	airportTooltip: {
		bake: function(layer) {
			gfx.baseMap[layer].airportTooltip = d3.select("body").append('div')
				.attr("class", "airport-tooltip")
				.style("opacity", 0);
		}
	},
	arcTooltip: {
		bake: function(layer) {
			gfx.baseMap[layer].arcTooltip = d3.select("body").append('div')
				.attr("class", "arc-tooltip")
				.style("opacity", 0);
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
			d3.csv('data/2015-flights.csv', function(error, flights){
				if (error) return console.log(error); // Unknown error, check the console
				// Store flights on the data object for reference later
				data.flights = crossfilter(data.transform.addDate(flights));
				flightsByMonth = data.flights.dimension(function(d) {return d['MONTH']});
				flightsByDate = data.flights.dimension(function(d) {return d.date});
				flightsByOriginAiports = data.flights.dimension(function(d) {return d['ORIGIN_AIRPORT_ID']});
				flightsByDestAirports = data.flights.dimension(function(d) {return d['DEST_AIRPORT_ID']});

				callback();
			});
		},
		airports: function(callback) {
			d3.json('data/us-airports.json', function(error, airports) {
				if (error) return console.log(error);
        //create airport location hash and airport property hash
        airports.features.forEach(function(airport) {
          var airportID = airport.properties.airportID;
          var airportName = airport.properties.displayAirportName;
          // coordinates are in Lng,Lat
          airportLocationHash[airportID] = airport.geometry.coordinates;
          airportNameHash[airportID] = airportName;
        });

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

// add slider for adjusting passenger range to filter airports
// add a dropdown to search for airports quickly