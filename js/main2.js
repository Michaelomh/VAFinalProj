//standard attributes

var outerWidth = 980;
var outerHeight = 200;
var margin = {
    left: 30,
    top: 100,
    right: 30,
    bottom: 30
};

var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;

//colour attributes

//svg initalisation
var monthView = d3.select("#monthView").insert("monthView")
    .attr("width", w)
    .attr("height", h);

//scaling variables
var scaleLinear = d3.scale.linear()
    .domain([1, 12])
    .range([0, w]);

//Loading data points
var dataset; //for top K airports

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

var num_passengers = 0;

d3.csv('data/2016-flights.csv', function (data) {
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
    jan = numberWithCommas(jan);
    feb = numberWithCommas(feb);
    mar = numberWithCommas(mar);
    apr = numberWithCommas(apr);
    may = numberWithCommas(may);
    jun = numberWithCommas(jun);
    jul = numberWithCommas(jul);
    aug = numberWithCommas(aug);
    sep = numberWithCommas(sep);
    oct = numberWithCommas(oct);
    nov = numberWithCommas(nov);
    dec = numberWithCommas(dec);
    /*    console.log("jan = " + jan);
        console.log("feb = " + feb);
        console.log("mar = " + mar);
        console.log("apr = " + apr);
        console.log("may = " + may);
        console.log("jun = " + jun);
        console.log("jul = " + jul);
        console.log("aug = " + aug);
        console.log("sep = " + sep);
        console.log("oct = " + oct);
        console.log("nov = " + nov);
        console.log("dec = " + dec);*/
});

function numberWithCommas(num) {
    var n = num.toString(),
        p = n.indexOf('.');
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) {
        return p < 0 || i < p ? ($0 + ',') : $0;
    });
}

var scale = d3.scale.linear()
    .domain([1, 12]) // Data space
    .range([3, 900]); // Pixel space


var MonthViewXscale = d3.scale.ordinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);


var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (data) {
        var toReturn = "<div style=\"text-align:center;\"><b>Year</b>: 2015<br>";
        toReturn += "<b>Month</b>: " + data + "<br>";
        switch (data) {
        case 1:
            num_passengers = jan
            break;
        case 2:
            num_passengers = feb
            break;
        case 3:
            num_passengers = mar
            break;
        case 4:
            num_passengers = apr
            break;
        case 5:
            num_passengers = may
            break;
        case 6:
            num_passengers = jun
            break;
        case 7:
            num_passengers = jul
            break;
        case 8:
            num_passengers = aug
            break;
        case 9:
            num_passengers = sep
            break;
        case 10:
            num_passengers = oct
            break;
        case 11:
            num_passengers = nov
            break;
        case 12:
            num_passengers = dec
            break;
        }
        toReturn += "<b>Passengers:</b><span> " + num_passengers + "</span></div>";
        return toReturn;
    });

var svg = d3.select("#monthView").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight);


svg.call(tip);

function render(data) {
    console.log(data);

    // Bind data
    var rects = svg.selectAll("rect").data(data);

    // Enter
    rects.enter().append("rect")
        .attr("y", 100)
        .attr("width", 70)
        .attr("height", 70)
        .attr("fill", "Blue")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("class", "monthView");

    // Update
    rects
        .attr("x", scale)
        .attr("id", MonthViewXscale);

    //Add the SVG Text Element to the svgContainer
    var text = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text");

    //Add SVG Text Element Attributes
    var textLabels = text
        .attr("y", 200)
        .text(function (data) {
            return data;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");
    
    text.attr("x", scale);


}

render([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

$("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").click(function (event) {
    $("#selectedMonth").text("Selected Month: " + event.target.id);
});

$("#resetMonth").click(function () {
    $("#selectedMonth").text("Selected Month: Nil ");
});