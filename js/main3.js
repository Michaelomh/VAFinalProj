      var margin = {
              top: 50,
              right: 0,
              bottom: 100,
              left: 30
          },
          width = 1080 - margin.left - margin.right,
          height = 1080 - margin.top - margin.bottom,
          gridSize = 15,
          legendElementWidth = gridSize * 2,
          buckets = 9,
          colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
          statesTo = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
          statesFrom = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

      /*
      IN CASE
      ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]*/

      var svg = d3.select("#matrix").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
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
          .style("font-size", "10px");

      var timeLabels = svg.selectAll(".timeLabel")
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
          .style("font-size", "10px");

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
                      .attr("x", function (d) {
                      /*console.log((d.hour - 1) * gridSize);*/
                          return (d.hour - 1) * gridSize;
                      })
                      .attr("y", function (d) {
                      /*console.log((d.day - 1) * gridSize);*/
                          return (d.day - 1) * gridSize;
                      })
                      .attr("rx", 4)
                      .attr("ry", 4)
                      .attr("class", "hour bordered")
                      .attr("width", gridSize)
                      .attr("height", gridSize)
                      .style("fill", colors[0]);

                  cards.transition().duration(1000)
                      .style("fill", function (d) {
                      console.log(d);
                          return colorScale(d.value);
                      });

                  cards.select("title").text(function (d) {
                      return d.value;
                  });

                  cards.exit().remove();

                  var legend = svg.selectAll(".legend")
                      .data([0].concat(colorScale.quantiles()), function (d) {
                          return d;
                      });

                  legend.enter().append("g")
                      .attr("class", "legend");

                  legend.append("rect")
                      .attr("x", function (d, i) {
                          return legendElementWidth * i;
                      })
                      .attr("y", height)
                      .attr("width", legendElementWidth)
                      .attr("height", gridSize / 2)
                      .style("fill", function (d, i) {
                          return colors[i];
                      })
                      .style("font-size", "8");

                  legend.append("text")
                      .attr("class", "mono")
                      .text(function (d) {
                          return "≥ " + Math.round(d);
                      })
                      .attr("x", function (d, i) {
                          return legendElementWidth * i;
                      })
                      .attr("y", height + gridSize);

                  legend.exit().remove();

              });
      };

      heatmapChart('data/testdata.csv');