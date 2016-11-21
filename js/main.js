// sample month (please insert later) = [startMonth, endMonth] CROSS FILTER INPUT **********
var monthArr = [1,12];

var outgoingPassengersRange = [0, 1e9];
var incomingPassengersRange = [0, 1e9];

var flightsByDate,
    flightsByOriginAiports,
    passengersByOriginAirports,
    flightsByDestAirports,
    passengersByDestAirports,
    flightsByOriginState,
    flightsByDestState,
    OriDestAirportsGroup;

var numberFormat = d3.formatPrefix('.2', 1e6);

var arcNumberFormat = d3.formatPrefix(',.1', 1e3);

var arcsData = [];

var airportLocationHash = {};
var airportNameHash = {};

var outRadius = d3.scaleSqrt()
    .range([0, 12]);

var inRadius = d3.scaleSqrt()
    .range([0, 12]);

var arcScale = d3.scaleLinear()
               .range([0, 5]);

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
			gfx.controls.bake(layer);
		},
		redraw: function(layer) {
			d3.selectAll(".arcs, .airports, .airport-legend, .arc-legend").remove();
			gfx.arcs.bake(layer);
			gfx.airports.bake(layer);
			// gfx.controls.update(outgoingPassengersRange[0],outgoingPassengersRange[1],document.getElementById('outPassengerSlider'));
		}
	},
	baseMap: {
		setValues: function(){
			// These values are shared among all instances of our basemap
			// Map dimensions (in pixels)
			this.width = 698;
			this.height = 500;

			// Map projection
			this.projection = d3.geoAlbersUsa()
					.scale(this.width*1.25)
					.translate([this.width/2, this.height/2+30]); //translate to center the map in view

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

			if (monthArr[0] !== monthArr[1]) {
				flightsByMonth.filter(monthArr);
			} else {
				flightsByMonth.filterExact(monthArr[0]);
			}

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

      OriDestAirportsGroup = OriDestAirportsDimension.group().reduceSum(function(d) {
        return d['PASSENGERS'];
      });
      // console.log(OriDestAirportsGroup.all());
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

      // dynaimcally set domain for arcs
      arcScale.domain([0, d3.max(arcsData, function(d) {return d.passengers})]);

			// In each group, create a path for each source/target pair.
			arc_group.append('path')
				.attr('d', function(d) {
					// console.log(d)
					// A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
					return d.passengers > 0 ? gfx.arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 5) : null;
					// return gfx.arcs.lngLatToArc(d, 'sourceLocation', 'targetLocation', 5);
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

			// arc legend

			gfx.baseMap[layer].legend = gfx.baseMap[layer].svg.append('g')
        .attr("class", "arc-legend")
        .attr("transform", "translate("+ (gfx.baseMap.width - 720) +",20)");

      var arcLegend = d3.legendSize()
        .scale(arcScale)
        .shape('line')
        .shapeWidth(50)
        .shapePadding(10)
        .labelOffset(28)
        // .labelAlign('start')
        .labelFormat(arcNumberFormat)
        .orient('horizontal');

      gfx.baseMap[layer].svg.select(".arc-legend")
        .call(arcLegend);
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
      console.log(airportData);
			// add outgoingPassengers and incomingPassengers to airportData
			airportData.features.forEach(function(airport) {
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

			// set domain for inRadius and outRadius
			this.minOutPassengers = 0;
			this.maxOutPassengers = d3.max(airportData.features, function(d) {return d.properties.outgoingPassengers});
			this.minInPassengers = 0;
			this.maxInPassengers = d3.max(airportData.features, function(d) {return d.properties.incomingPassengers});
			if (outgoingPassengersRange[0] > this.minOutPassengers) {
				this.minOutPassengers = +outgoingPassengersRange[0];
			}
			if (outgoingPassengersRange[1] < this.maxOutPassengers) {
				this.maxOutPassengers = +outgoingPassengersRange[1];
			}

			if (incomingPassengersRange[0] > this.minInPassengers) {
				this.minInPassengers = +incomingPassengersRange[0];
			}
			if (incomingPassengersRange[1] < this.maxInPassengers) {
				this.maxInPassengers = +incomingPassengersRange[1];
			}

			outRadius.domain([this.minOutPassengers, this.maxOutPassengers]);
			inRadius.domain([this.minInPassengers, this.maxInPassengers]);
      //add symbols for outgoing passsengers
			var outAirports = gfx.baseMap[layer].airports.selectAll("airports")
				.data(airportData.features)
			.enter()
				.append("path")
				.attr("class", "airport out-airport")
				.attr("d", gfx.baseMap.path.pointRadius(function(d) {
          return (typeof d.properties.outgoingPassengers != 'undefined' && +d.properties.outgoingPassengers > gfx.airports.minOutPassengers && +d.properties.outgoingPassengers < gfx.airports.maxOutPassengers) ? outRadius(d.properties.outgoingPassengers) : 0;
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
						.style("opacity", .9);
					gfx.baseMap[layer].airportTooltip.html(
							'<p class="airport-name">' + d.properties.displayAirportName + "</p>" +
							'<p class="airport-city-name">' + d.properties.displayAirportCityName + '</p>' +
							'<b>Outgoing Passengers: ' + numberFormat(d.properties.outgoingPassengers) + "</b><br/>" +
							'Incoming Passengers: ' + numberFormat(d.properties.incomingPassengers))
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
				}).on("mouseout", function(d) {
          gfx.baseMap[layer].airportTooltip.transition()
          	.duration(500)
            .style("opacity", 0);
        });

    	outAirports.exit().remove();

    	//add symbols for incoming passsengers
			var inAirports = gfx.baseMap[layer].airports.selectAll("airports")
				.data(airportData.features)
			.enter()
				.append("path")
				.attr("class", "airport in-airport")
				.attr("d", gfx.baseMap.path.pointRadius(function(d) {
          return (typeof d.properties.incomingPassengers != 'undefined' && +d.properties.incomingPassengers > gfx.airports.minInPassengers && +d.properties.incomingPassengers < gfx.airports.maxInPassengers) ? inRadius(d.properties.incomingPassengers) : 0;
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
						.style("opacity", .9);
					gfx.baseMap[layer].airportTooltip.html(
							'<p class="airport-name">' + d.properties.displayAirportName + '</p>' +
							'<p class="airport-city-name">' + d.properties.displayAirportCityName + '</p>' +
							'Outgoing Passengers: ' + numberFormat(d.properties.outgoingPassengers) + '<br/>' +
							'<b>Incoming Passengers: ' + numberFormat(d.properties.incomingPassengers) + '</b>')
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
				}).on("mouseout", function(d) {
          gfx.baseMap[layer].airportTooltip.transition()
          	.duration(500)
            .style("opacity", 0);
        });
    	inAirports.exit().remove();

      // add outgoing airport legend

      gfx.baseMap[layer].outLegend = gfx.baseMap[layer].svg.append('g')
        .attr("class", "airport-legend out-airport-legend")
        .attr("transform", "translate("+ (gfx.baseMap.width - 270) +",20)");

      var outAirportLegend = d3.legendSize()
        .scale(outRadius)
        .shape('circle')
        .shapePadding(30)
        .labelOffset(20)
        .labelFormat(numberFormat)
        .orient('horizontal');

      gfx.baseMap[layer].svg.select(".out-airport-legend")
        .call(outAirportLegend);

     	// add incoming airport legend
      gfx.baseMap[layer].inLegend = gfx.baseMap[layer].svg.append('g')
        .attr("class", "airport-legend in-airport-legend")
        .attr("transform", "translate("+ (gfx.baseMap.width - 270) +",20)");

      var inAirportLegend = d3.legendSize()
        .scale(inRadius)
        .shape('circle')
        .shapePadding(30)
        .labelOffset(20)
        .labelFormat(numberFormat)
        .orient('horizontal');

      gfx.baseMap[layer].svg.select(".in-airport-legend")
        .call(inAirportLegend);

    	if ($('.toggle-switch input[type=checkbox]').prop('checked')) {
	  			$('.out-airport, .out-airport-legend').hide();
      		$('.in-airport, .in-airport-legend').show();
      	} else {
      		$('.in-airport, .in-airport-legend').hide();
    			$('.out-airport, .out-airport-legend').show();
    	};

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
	},
	controls: {
		bake: function() {
		  var outPassengerSlider = document.getElementById('outPassengerSlider');
      var outPassengerStart = document.getElementById('outPassengersStart');
      var outPassengerEnd = document.getElementById('outPassengersEnd');
      var inPassengerSlider = document.getElementById('inPassengerSlider');
      var inPassengerStart = document.getElementById('inPassengersStart');
      var inPassengerEnd = document.getElementById('inPassengersEnd');

      noUiSlider.create(outPassengerSlider, {
      	start: [0, 5000000],
      	connect: true,
      	range: {
      		'min': 0,
      		'max': 5000000
      	},
      	step: 1000
      	// tooltips: [wNumb({ decimals: 0, thousand: ',' }), wNumb({ decimals: 0, thousand: ',' })]
      });

      outPassengerSlider.noUiSlider.on('update', function(values, handle) {
      	if ( handle == 0 ) {
      		values[handle] == 0 ? outPassengerStart.innerHTML = 0 : outPassengerStart.innerHTML = d3.formatPrefix(',.0', 1e3)(values[handle]);
      	}
      	if ( handle == 1 ) {
      		values[handle] == 0 ? outPassengerEnd.innerHTML = 0 : outPassengerEnd.innerHTML = d3.formatPrefix(',.0', 1e3)(values[handle]);
      	}
      });

      outPassengerSlider.noUiSlider.on('change', function(values, handle) {
      	outgoingPassengersRange = values;
      	gfx.viz.redraw("main");
      });

      noUiSlider.create(inPassengerSlider, {
      	start: [0, 5000000],
      	connect: true,
      	range: {
      		'min': 0,
      		'max': 5000000
      	},
      	step: 1000
      	// tooltips: [wNumb({ decimals: 0, thousand: ',' }), wNumb({ decimals: 0, thousand: ',' })]
      });

      inPassengerSlider.noUiSlider.on('update', function(values, handle) {
      	if ( handle == 0 ) {
      		values[handle] == 0 ? inPassengerStart.innerHTML = 0 : inPassengerStart.innerHTML = d3.formatPrefix(',.0', 1e3)(values[handle]);
      	}
      	if ( handle == 1 ) {
      		values[handle] == 0 ? inPassengerEnd.innerHTML = 0 : inPassengerEnd.innerHTML = d3.formatPrefix(',.0', 1e3)(values[handle]);
      	}
      });

      inPassengerSlider.noUiSlider.on('change', function(values, handle) {
      	incomingPassengersRange = values;
      	gfx.viz.redraw("main");
      });

      // add event listener to checkbox
      $('.toggle-switch input[type=checkbox]').change(function(){
      	if ($('.toggle-switch input[type=checkbox]').prop('checked')) {
      		$('.out-airport, .out-airport-legend').hide();
      		$('.in-airport, .in-airport-legend').show();
      	} else {
      		$('.in-airport, .in-airport-legend').hide();
    			$('.out-airport, .out-airport-legend').show();
      	}
	    });
    },
    update: function(min, max, slider) {
    	slider.noUiSlider.updateOptions({
    		range: {
    			'min': min,
    			'max': max
    		}
    	})
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
				flightsByMonth = data.flights.dimension(function(d) {return +d['MONTH']});
				flightsByDate = data.flights.dimension(function(d) {return d.date});
				flightsByOriginAiports = data.flights.dimension(function(d) {return d['ORIGIN_AIRPORT_ID']});
				flightsByDestAirports = data.flights.dimension(function(d) {return d['DEST_AIRPORT_ID']});
        flightsByOriginState = data.flights.dimension(function(d) {return d['ORIGIN_STATE_ABR']});
        flightsByDestState = data.flights.dimension(function(d) {return d['DEST_STATE_ABR']});
				flightsByPassengers = data.flights.dimension(function(d) {return d['PASSENGERS']});
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

// something is wrong with the arcs - doesnt show up for some when airport detail shows flights
// add slider for adjusting passenger range to filter airports
// add a dropdown to search for airports quickly