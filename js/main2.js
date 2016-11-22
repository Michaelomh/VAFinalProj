//standard attributes
var outerWidth = 940,
    outerHeight = 180,
    margin = {
        left: 30,
        top: 20,
        right: 30,
        bottom: 30
    },
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom;

var numberLegendFormat = d3.formatPrefix('.1', 1e6);
var numberMatrixLegendFormat = d3.formatPrefix('.1', 1e3);

//svg initalisation
var monthView = d3.select("#monthView").insert("monthView")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

//scaling variables
var scaleLinear = d3.scaleLinear()
    .domain([1, 12])
    .range([0, innerWidth]);

var colors = ["#7acbdc", "#081d58"];
var monthPassengers = [];

var jan = 0;
var feb = 0;
var mar = 0;
var apr = 0;
var may = 0;
var jun = 0;
var jul = 0;
var aug = 0;
var sep = 0;
var oct = 0;
var nov = 0;
var dec = 0;

d3.csv('data/2015-flights.csv', function (data) {
    data.forEach(function (d) {
        switch (d.MONTH) {
        case "1":
            jan += parseFloat(d.PASSENGERS);
            break;
        case "2":
            feb += parseFloat(d.PASSENGERS);
            break;
        case "3":
            mar += parseFloat(d.PASSENGERS);
            break;
        case "4":
            apr += parseFloat(d.PASSENGERS);
            break;
        case "5":
            may += parseFloat(d.PASSENGERS);
            break;
        case "6":
            jun += parseFloat(d.PASSENGERS);
            break;
        case "7":
            jul += parseFloat(d.PASSENGERS);
            break;
        case "8":
            aug += parseFloat(d.PASSENGERS);
            break;
        case "9":
            sep += parseFloat(d.PASSENGERS);
            break;
        case "10":
            oct += parseFloat(d.PASSENGERS);
            break;
        case "11":
            nov += parseFloat(d.PASSENGERS);
            break;
        case "12":
            dec += parseFloat(d.PASSENGERS);
            break;
        }

    });
    monthPassengers.push(jan);
    monthPassengers.push(feb);
    monthPassengers.push(mar);
    monthPassengers.push(apr);
    monthPassengers.push(may);
    monthPassengers.push(jun);
    monthPassengers.push(jul);
    monthPassengers.push(aug);
    monthPassengers.push(sep);
    monthPassengers.push(oct);
    monthPassengers.push(nov);
    monthPassengers.push(dec);
});


var scale = d3.scaleLinear()
    .domain([1, 12]) // Data space
    .range([0, 840]); // Pixel space

var MonthViewXaxis = d3.scaleLinear()
    .domain([1, 12])
    .range([25, 860]);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([150, 0])
    .html(function (data) {
        var toReturn = "<div style=\"text-align:center;\"><b>Year</b>: 2015<br>";
        toReturn += "<b>Month</b>: " + data + "<br>";
        toReturn += "<b>Passengers:</b><span> " + numberWithCommas(monthPassengers[data - 1]) + "</span></div>";
        return toReturn;
    });

var svgMonth = d3.select("#monthView").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

svgMonth.call(tip);

function render(data) {
    var colorScale = d3.scaleQuantize()
        .domain([d3.min(monthPassengers), d3.max(monthPassengers)])
        .range(colors);

    // Bind data
    var rects = svgMonth.selectAll("rect").data(data);

    // Enter
    rects.enter()
        .append("rect")
        .attr("y", 40)
        .attr("width", 70)
        .attr("height", 70)
        /*.attr("fill", colors[0])*/
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("class", "monthView")
        .attr("x", scale)
        .attr("id", function (d) {
            return convertMonth(d);
        })
        .style("fill", function (d) {
            return colorScale(monthPassengers[d - 1]);
        });

    //Add the SVG Text Element to the svgContainer
    var text = svgMonth.selectAll("text")
        .data(data)
        .enter()
        .append("text");

    //Add SVG Text Element Attributes
    var textLabels = text
        .attr("y", 30)
        .text(function (data) {
            return convertMonth(data)
        })
        .attr("font-size", "14px")
        .attr("font-weight", "700")
        .attr("fill", "black");

    text.attr("x", MonthViewXaxis);

    var monthLegendScale = d3.scaleQuantize()
        .domain([d3.min(monthPassengers), d3.max(monthPassengers)])
        .range(["#7acbdc", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]);

    var svg = d3.select("svg");

    svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(" + (innerWidth - 450) + ", 125)");

    var legendLinear = d3.legendColor()
        .shapeWidth(80)
        .shapeHeight(20)
        .cells([6])
        .orient('horizontal')
        .labelFormat(numberLegendFormat)
        .shapePadding(0)
        .scale(monthLegendScale);

    svg.select(".legendLinear")
        .call(legendLinear);

    $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").addClass("activeMonthView");
}


$(document).ready(function () {
    setTimeout(function () {
        render([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); //Used to render month view

        //jQuery for the monthview to grow or shrink accordingly to whether selected or not.
        //Big = Selected
        //Small = not Selected
        $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").click(function (event) {
            var selectedEvent = event.target.id;
            drawHeatMap();
            switch (selectedEvent) {
            case "Jan":
                skipSlider.noUiSlider.set([0, 0]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Jan").addClass("activeMonthView");
                $("#selectedMonth").text("Jan");
                break;
            case "Feb":
                skipSlider.noUiSlider.set([1, 1]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Feb").addClass("activeMonthView");
                $("#selectedMonth").text("Feb");
                break;
            case "Mar":
                skipSlider.noUiSlider.set([2, 2]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Mar").addClass("activeMonthView");
                $("#selectedMonth").text("Mar");
                break;
            case "Apr":
                skipSlider.noUiSlider.set([3, 3]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Apr").addClass("activeMonthView");
                $("#selectedMonth").text("Apr");
                break;
            case "May":
                skipSlider.noUiSlider.set([4, 4]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#May").addClass("activeMonthView");
                $("#selectedMonth").text("May");
                break;
            case "Jun":
                skipSlider.noUiSlider.set([5, 5]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Jun").addClass("activeMonthView");
                $("#selectedMonth").text("Jun");
                break;
            case "Jul":
                skipSlider.noUiSlider.set([6, 6]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Jul").addClass("activeMonthView");
                $("#selectedMonth").text("Jul");
                break;
            case "Aug":
                skipSlider.noUiSlider.set([7, 7]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Aug").addClass("activeMonthView");
                $("#selectedMonth").text("Aug");
                break;
            case "Sep":
                skipSlider.noUiSlider.set([8, 8]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Sep").addClass("activeMonthView");
                $("#selectedMonth").text("Sep");
                break;
            case "Oct":
                skipSlider.noUiSlider.set([9, 9]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Oct").addClass("activeMonthView");
                $("#selectedMonth").text("Oct");
                break;
            case "Nov":
                skipSlider.noUiSlider.set([10, 10]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Nov").addClass("activeMonthView");
                $("#selectedMonth").text("Nov");
                break;
            case "Dec":
                skipSlider.noUiSlider.set([11, 11]);
                $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
                $("#Dec").addClass("activeMonthView");
                $("#selectedMonth").text("Dec");
                break;
            }
        });

        $("#resetMonth").click(function () {
            $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
            skipSlider.noUiSlider.set([0, 11]);
            $("#selectedMonth").text("All");
            drawHeatMap();
        });
    }, 2000);
});

//START of SLIDER UI for MONTH
var skipSlider = document.getElementById('skipstep');

noUiSlider.create(skipSlider, {
    connect: true,
    range: {
        'min': 0,
        '9.1%': 1,
        '18.2%': 2,
        '27.3%': 3,
        '36.4%': 4,
        '45.5%': 5,
        '54.6%': 6,
        '63.6%': 7,
        '72.7%': 8,
        '81.8%': 9,
        '91%': 10,
        'max': 11
    },
    behaviour: 'drag',
    snap: true,
    start: [0, 110]
});


skipSlider.noUiSlider.on('set', function (values, handle) {
    var start = Math.floor(values[0]);
    var end = Math.floor(values[1]);
    var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthSelected = [];
    for (var i = start; i < end + 1; i++) {
        monthSelected.push(monthArray[i]);
    }

    if (monthSelected.length === 12) {
        $("#selectedMonth").text("All");
        $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").addClass("activeMonthView");
    } else {
        $("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").removeClass("activeMonthView");
        var toPrint = ""
        for (var i = 0; i < monthSelected.length; i++) {
            toPrint += monthSelected[i];
            toPrint += ", "
            $("#" + monthSelected[i]).addClass("activeMonthView");
        }
        $("#selectedMonth").text(toPrint.substr(0, toPrint.length - 2));
    }

    monthArr = [start + 1, end + 1]
        // redraw map
    gfx.viz.redraw("main");
    drawHeatMap();
    // console.log(monthArr);
});
//END of SLIDER UI for MONTH

//START OF MISC FUNCTIONS
//Convert Month Value int Month's Shortform
function convertMonth(x) {
    var toReturn = "";

    switch (x) {
    case 1:
        toReturn = "Jan"
        break;
    case 2:
        toReturn = "Feb"
        break;
    case 3:
        toReturn = "Mar"
        break;
    case 4:
        toReturn = "Apr"
        break;
    case 5:
        toReturn = "May"
        break;
    case 6:
        toReturn = "Jun"
        break;
    case 7:
        toReturn = "Jul"
        break;
    case 8:
        toReturn = "Aug"
        break;
    case 9:
        toReturn = "Sep"
        break;
    case 10:
        toReturn = "Oct"
        break;
    case 11:
        toReturn = "Nov"
        break;
    case 12:
        toReturn = "Dec"
        break;
    }
    return toReturn;
}

//function to convert a number, to separate by commas at the thousands place.
function numberWithCommas(num) {
    var n = num.toString(),
        p = n.indexOf('.');
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) {
        return p < 0 || i < p ? ($0 + ',') : $0;
    });
}
//END OF MISC FUNCTIONS