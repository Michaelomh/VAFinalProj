var margin = {
        top: 225,
        right: 0,
        bottom: 200,
        left: 150
    },
    width = 1080 - margin.left - margin.right,
    height = 1180 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 54),
    legendElementWidth = gridSize * 4,
    buckets = 6,
    colors = ["#7acbdc", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
    statesTo = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Trinidad & Tobago", "Utah", "Vermont", "Virgin Islands", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
    statesFrom = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Trinidad & Tobago", "Utah", "Vermont", "Virgin Islands", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
    OriDestABRGroup;

var matrixSvg = d3.select("#matrix").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (margin.left - 20) + "," + 50 + ")");

var dayLabels = matrixSvg.selectAll(".dayLabel")
    .data(statesTo)
    .enter().append("g")
    .attr("transform", function (d, i) {
        return "translate(-6," + (gridSize / 2 - 2) + ")";
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

var matrixData;

var timeLabels = matrixSvg.selectAll(".timeLabel")
    .data(statesFrom)
    .enter().append("g")
    .attr("transform", function (d, i) {
        return "translate(" + (gridSize / 2 - 2) + ", -6)rotate(90)";
    })
    .append("text")
    .attr("x", 910)
    .attr("y", function (d, i) {
        return -i * gridSize;
    })
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .text(function (d) {
        return d;
    });

var drawNullMap = function (csvFile) {
    d3.csv(csvFile,
        function (d) {
            return {
                day: d.day,
                hour: d.hour
            };
        },
        function (data) {
            var cards = matrixSvg.selectAll(".hour")
                .data(data, function (d) {
                    return d.day + ':' + d.hour;
                });

            cards.enter().append("rect")
                .attr("x", function (d) {
                    return (d.hour - 1) * gridSize;
                })
                .attr("y", function (d) {
                    return (d.day - 1) * gridSize;
                })
                .attr("class", "clear")
                .attr("width", gridSize - 4)
                .attr("height", gridSize - 4)
                .style("fill", "none")
                .style("opacity", "0.3");

            cards.exit().remove();
        });
};

function drawHeatMap() {
    matrixData = OriDestABRGroup.all();

    var matrixTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-15, 0])
        .html(function (data) {
            //            console.log(data);
            var toReturn = "<div style=\"text-align:center;\">Origin - Destination<br>";
            toReturn += convertABRtoCountry(data.key.destABR) + " - " + convertABRtoCountry(data.key.originABR);
            toReturn += "<br>Passengers: <span>" + numberWithCommas(data.value) + "</span></div>";
            return toReturn;
        });

    matrixSvg.call(matrixTip);

    var colorMatrixScale = d3.scaleQuantize()
        .domain([0, 100000])
        .range(colors);

    var cards = matrixSvg.selectAll(".hour")
        .data(matrixData, function (d) {
            return d.key.originID + ':' + d.key.destID;
        });

    cards.enter().append("rect")
        .attr("x", function (d) {
            //console.log("x = " + (d.key.destID - 1));
            return (d.key.destID - 1) * gridSize;
        })
        .attr("y", function (d) {
            //console.log("y = " + (d.key.originID - 1));
            return (d.key.originID - 1) * gridSize;
        })
        .attr("width", gridSize - 4)
        .attr("height", gridSize - 4)
        .on('mouseover', matrixTip.show)
        .on('mouseout', matrixTip.hide)
        .style("fill", function (d) {
            return colorMatrixScale(d.value);
        });

    cards.exit().remove();

    var matrixLegendScale = d3.scaleQuantize()
        .domain([0, 100000])
        .range(["#7acbdc", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]);

    var matrixLegendSvg = d3.select("#matrix svg");

    matrixLegendSvg.append("g")
        .attr("class", "matrixLegendLinear")
        .attr("transform", "translate(" + (innerWidth - 330) + ", 0)");

    var matrixLegendLinear = d3.legendColor()
        .shapeWidth(80)
        .shapeHeight(20)
        .cells([6])
        .orient('horizontal')
        .labelFormat(numberMatrixLegendFormat)
        .shapePadding(0)
        .scale(matrixLegendScale);

    matrixLegendSvg.select(".matrixLegendLinear")
        .call(matrixLegendLinear);
}


$(document).ready(function () {
    setTimeout(function () {
        loadMatrixData();
        drawHeatMap();
        drawNullMap("data/nulldata.csv");
    }, 3000);
});

function loadMatrixData() {
    var OriDestABRDimension = data.flights.dimension(function (d) {
        //stringify() and later, parse() to get keyed objects
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
    case "PR":
        return 39;
        break;
    case "RI":
        return 40;
        break;
    case "SC":
        return 41;
        break;
    case "SD":
        return 42;
        break;
    case "TN":
        return 43;
        break;
    case "TX":
        return 44;
        break;
    case "TT":
        return 45;
        break;
    case "UT":
        return 46;
        break;
    case "VT":
        return 47;
        break;
    case "VI":
        return 48;
        break;
    case "VA":
        return 49;
        break;
    case "WA":
        return 50;
        break;
    case "WV":
        return 51;
        break;
    case "WI":
        return 52;
        break;
    case "WY":
        return 53;
        break;
    default:
        console.log(stateABR);
        return 1000;
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
    case "PR":
        return "Puerto Rico";
        break;
    case "TT":
        return "Trinidad & Tobago";
        break;
    case "VI":
        return "Virgin Islands";
        break;
    }
}