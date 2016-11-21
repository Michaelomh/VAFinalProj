      var margin = {
              top: 125,
              right: 0,
              bottom: 200,
              left: 150
          },
          width = 1080 - margin.left - margin.right,
          height = 1080 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 50),
          legendElementWidth = gridSize * 2,
          buckets = 6,
          colors = ["#7acbdc", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
          statesTo = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
          statesFrom = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

      /*
      IN CASE
      ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
      ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]*/

      var svg = d3.select("#matrix").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(statesTo)
          .enter().append("g")
          .attr("transform", function (d, i) {
              return "translate(-6," + gridSize / 1.5 + ")";
          })
          .append("text")
          .attr("x", -6)
          .attr("y", function (d, i) {
              return i * gridSize;
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
                          /*console.log((d.hour - 1) * gridSize);*/
                          return (d.hour - 1) * gridSize;
                      })
                      .attr("y", function (d) {
                          /*console.log((d.day - 1) * gridSize);*/
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

      heatmapChart('data/testdata.csv');


      var OriDestABRGroup

      $(document).ready(function () {
          setTimeout(function () {
              var OriDestABRDimension = data.flights.dimension(function (d) {
                  //stringify() and later, parse() to get keyed objects
                  return JSON.stringify({
                      originABR: d["ORIGIN_STATE_ABR"],
                      destABR: d["DEST_STATE_ABR"]
                  });
              });

              OriDestABRGroup = OriDestABRDimension.group().reduceSum(function (d) {
                  return d['PASSENGERS'];
              });

              OriDestABRGroup.all().forEach(function (d) {
                  d.key = JSON.parse(d.key);
              });
              console.log(OriDestABRGroup.all());
          }, 10000);
      });
