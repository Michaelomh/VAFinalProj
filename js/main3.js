      var margin = {
              top: 125,
              right: 0,
              bottom: 200,
              left: 150
          },
          width = 1080 - margin.left - margin.right,
          height = 1080 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 50),
          legendElementWidth = gridSize * 4,
          buckets = 6,
          colors = ["#7acbdc", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
          statesTo = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
          statesFrom = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
          OriDestABRGroup;

      /*
      IN CASE
      ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
      ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]*/

      var svg = d3.select("#matrix").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(statesTo)
          .enter().append("g")
          .attr("transform", function (d, i) {
              return "translate(-6," + gridSize / 2 + ")";
          })
          .append("text")
          .attr("x", 0)
          .attr("y", function (d, i) {
              return (i * gridSize);
          })
          .attr("dy", ".32em")
          .attr("text-anchor", "end")
          .text(function (d) {
              return d;
          });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(statesFrom)
          .enter().append("g")
          .attr("transform", function (d, i) {
              return "translate(" + gridSize / 2 + ", -6)rotate(-90)";
          })
          .append("text")
          .attr("x", 0)
          .attr("y", function (d, i) {
              return i * gridSize;
          })
          .attr("dy", ".32em")
          .attr("text-anchor", "start")
          .text(function (d) {
              return d;
          });

      /*var dayLabels = svg.selectAll(".dayLabel")
          .data(statesTo)
          .enter().append("text")
          .text(function (d) {
              return d;
          })
          .attr("x", 0)
          .attr("y", function (d, i) {
              return i * gridSize;
          })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
          .attr("class", function (d) {
              return ("to" + d);
          })
          .style("font-size", "10px");*/



      /*      var timeLabels = svg.selectAll(".timeLabel")
                .data(statesFrom)
                .enter().append("text")
                .text(function (d) {
                    return d;
                })
                .attr("x", function (d, i) {
                    return i * gridSize;
                })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function (d) {
                    return ("from" + d);
                })
                .style("font-size", "10px");*/


      /*
            var heatmapChart = function (csvFile) {
                d3.csv(csvFile,
                    function (d) {
                        return {
                            day: d.day,
                            hour: d.hour,
                            value: +d.value
                        };
                    },
                    function (error, data) {
                        console.log(data);
                        var colorScale = d3.scaleQuantile()
                            .domain([0, buckets - 1, d3.max(data, function (d) {
                                return d.value;
                            })])
                            .range(colors);


                        var cards = svg.selectAll(".hour")
                            .data(data, function (d) {
                                return d.day + ':' + d.hour;
                            });

                        cards.append("title");

                        cards.enter().append("rect")
                            .attr("x", function (d, i) {
                                //console.log((d.hour - 1) * gridSize);
                                return (d.hour - 1) * gridSize;
                            })
                            .attr("y", function (d) {
                                //console.log((d.day - 1) * gridSize);
                                return (d.day - 1) * gridSize;
                            })
                            .attr("rx", 3)
                            .attr("ry", 3)
                            .attr("class", "hour bordered")
                            .attr("width", gridSize - 2)
                            .attr("height", gridSize - 2)
                            .style("fill", function (d) {
                                return colorScale(d.value);
                            });

                        cards.exit().remove();

                    });
            };

            heatmapChart('data/testdata.csv');*/

      function drawHeatMap() {

          var matrixTip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-15, 0])
              .html(function (data) {
                  console.log(data);
                  var toReturn = "<div style=\"text-align:center;\">Origin: " + convertABRtoCountry(data.key.originABR) + "<br>";
                  toReturn += "<div style=\"text-align:center;\">Destination: " + convertABRtoCountry(data.key.destABR) + "<br>";
                  toReturn += "Passengers: <span>" + numberWithCommas(data.value) + "</span></div>";
                  return toReturn;
              });

          svg.call(matrixTip);

          var matrixData = OriDestABRGroup.all();

          var colorScale = d3.scaleQuantile()
              .domain([0, buckets - 1, d3.max(matrixData, function (d) {
                  return d.value;
              })])
              .range(colors);


          var cards = svg.selectAll(".hour")
              .data(matrixData, function (d) {
                  return d.key.originID + ':' + d.key.destID;
              });

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function (d) {
                  if (d.key.destID === 51) {
                      return null;
                  } else {
                      return (d.key.destID - 1) * gridSize;
                  }

              })
              .attr("y", function (d) {
                  if (d.key.originID === 51) {
                      return null;
                  } else {
                      return (d.key.originID - 1) * gridSize;
                  }

              })
              .attr("rx", 3)
              .attr("ry", 3)
              .attr("class", "hour bordered")
              .attr("width", gridSize - 2)
              .attr("height", gridSize - 2)
              .on('mouseover', matrixTip.show)
              .on('mouseout', matrixTip.hide)
              .style("fill", function (d) {
                  return colorScale(d.value);
              });

          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function (d) {
                  return d;
              });

          legend.enter().append("g")
              .attr("class", "legend")
              .append("rect")
              .attr("x", function (d, i) {
                  console.log(legendElementWidth * i);
                  return legendElementWidth * i;
              })
              .attr("y", 0)
              .attr("width", legendElementWidth)
              .attr("height", gridSize)
              .attr("transform", "translate(" + width / 2 + ",-100)")
              .style("fill", function (d, i) {
                  return colors[i];
              }).append("text")
              .attr("class", "mono")
              .text(function (d) {
                  return "≥ " + Math.round(d);
              })
              .attr("x", function (d, i) {
                  console.log(legendElementWidth * i);
                  return legendElementWidth * i;
              })
              .attr("y", gridSize);

          legend.exit().remove();
      }


      $(document).ready(function () {
          setTimeout(function () {
              loadMatrixData();
              drawHeatMap();
          }, 3000);
      });


      function loadMatrixData() {
          var OriDestABRDimension = data.flights.dimension(function (d) {
              //stringify() and later, parse() to get keyed objects

              /*var originStateABR = convertStateToNumber(d["ORIGIN_STATE_ABR"]);
              var destStateABR = convertStateToNumber(d["DEST_STATE_ABR"]);*/

              return JSON.stringify({
                  originABR: d["ORIGIN_STATE_ABR"],
                  originID: convertStateToNumber(d["ORIGIN_STATE_ABR"]),
                  destABR: d["DEST_STATE_ABR"],
                  destID: convertStateToNumber(d["DEST_STATE_ABR"]),
              });
          });

          OriDestABRGroup = OriDestABRDimension.group().reduceSum(function (d) {
              return d['PASSENGERS'];
          });

          OriDestABRGroup.all().forEach(function (d) {
              d.key = JSON.parse(d.key);
          });
          console.log(OriDestABRGroup.all());
      }


      function convertStateToNumber(stateABR) {
          switch (stateABR) {
          case "AL":
              return 1;
              break;
          case "AK":
              return 2;
              break;
          case "AZ":
              return 3;
              break;
          case "AR":
              return 4;
              break;
          case "CA":
              return 5;
              break;
          case "CO":
              return 6;
              break;
          case "CT":
              return 7;
              break;
          case "DE":
              return 8;
              break;
          case "FL":
              return 9;
              break;
          case "GA":
              return 10;
              break;
          case "HI":
              return 11;
              break;
          case "ID":
              return 12;
              break;
          case "IL":
              return 13;
              break;
          case "IN":
              return 14;
              break;
          case "IA":
              return 15;
              break;
          case "KS":
              return 16;
              break;
          case "KY":
              return 17;
              break;
          case "LA":
              return 18;
              break;
          case "ME":
              return 19;
              break;
          case "MD":
              return 20;
              break;
          case "MA":
              return 21;
              break;
          case "MI":
              return 22;
              break;
          case "MN":
              return 23;
              break;
          case "MS":
              return 24;
              break;
          case "MO":
              return 25;
              break;
          case "MT":
              return 26;
              break;
          case "NE":
              return 27;
              break;
          case "NV":
              return 28;
              break;
          case "NH":
              return 29;
              break;
          case "NJ":
              return 30;
              break;
          case "NM":
              return 31;
              break;
          case "NY":
              return 32;
              break;
          case "NC":
              return 33;
              break;
          case "ND":
              return 34;
              break;
          case "OH":
              return 35;
              break;
          case "OK":
              return 36;
              break;
          case "OR":
              return 37;
              break;
          case "PA":
              return 38;
              break;
          case "RI":
              return 39;
              break;
          case "SC":
              return 40;
              break;
          case "SD":
              return 41;
              break;
          case "TN":
              return 42;
              break;
          case "TX":
              return 43;
              break;
          case "UT":
              return 44;
              break;
          case "VT":
              return 45;
              break;
          case "VA":
              return 46;
              break;
          case "WA":
              return 47;
              break;
          case "WV":
              return 48;
              break;
          case "WI":
              return 49;
              break;
          case "WY":
              return 50;
              break;
          default:
              return 51;
              break;
          }
      }

      function convertABRtoCountry(abr) {
          switch (abr) {
          case "AL":
              return "Alabama";
              break;
          case "AK":
              return "Alaska";
              break;
          case "AZ":
              return "Arizona";
              break;
          case "AR":
              return "Arkansas";
              break;
          case "CA":
              return "California";
              break;
          case "CO":
              return "Colorado";
              break;
          case "CT":
              return "Connecticut";
              break;
          case "DE":
              return "Delaware";
              break;
          case "FL":
              return "Florida";
              break;
          case "GA":
              return "Georgia";
              break;
          case "HI":
              return "Hawaii";
              break;
          case "ID":
              return "Idaho";
              break;
          case "IL":
              return "Illinois";
              break;
          case "IN":
              return "Indiana";
              break;
          case "IA":
              return "Iowa";
              break;
          case "KS":
              return "Kansas";
              break;
          case "KY":
              return "Kentucky";
              break;
          case "LA":
              return "Louisiana";
              break;
          case "ME":
              return "Maine";
              break;
          case "MD":
              return "Maryland";
              break;
          case "MA":
              return "Massachusetts";
              break;
          case "MI":
              return "Michigan";
              break;
          case "MN":
              return "Minnesota";;
              break;
          case "MS":
              return "Mississippi";
              break;
          case "MO":
              return "Missouri";
              break;
          case "MT":
              return "Montana";
              break;
          case "NE":
              return "Nebraska";
              break;
          case "NV":
              return "Nevada";
              break;
          case "NH":
              return "New Hampshire";
              break;
          case "NJ":
              return "New Jersey";
              break;
          case "NM":
              return "New Mexico";
              break;
          case "NY":
              return "New York";
              break;
          case "NC":
              return "North Carolina";
              break;
          case "ND":
              return "North Dakota";
              break;
          case "OH":
              return "Ohio";
              break;
          case "OK":
              return "Oklahoma";
              break;
          case "OR":
              return "Oregon";
              break;
          case "PA":
              return "Pennsylvania";
              break;
          case "RI":
              return "Rhode Island";
              break;
          case "SC":
              return "South Carolina";
              break;
          case "SD":
              return "South Dakota";
              break;
          case "TN":
              return "Tennessee";
              break;
          case "TX":
              return "Texas";
              break;
          case "UT":
              return "Utah";
              break;
          case "VT":
              return "Vermont";
              break;
          case "VA":
              return "Virginia";
              break;
          case "WA":
              return "Washington";
              break;
          case "WV":
              return "West Virginia";
              break;
          case "WI":
              return "Wisconsin";
              break;
          case "WY":
              return "Wyoming";
              break;
          }
      }