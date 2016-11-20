//standard attributes

var outerWidth = 980;
var outerHeight = 150;
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
    .attr("width", innerWidth)
    .attr("height", innerHeight);

//scaling variables
var scaleLinear = d3.scaleLinear()
    .domain([1, 12])
    .range([0, innerWidth]);

//Loading data points
var dataset; //for top K airports

var colors = ["#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];
var buckets = 6;
var monthPassengers = [16705222, 15327531, 16452608, 16984795, 14403943, 15694134, 13345572, 15025450, 17442945, 18454087, 19370589,16692077];

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

d3.csv('data/2015-flights.csv', function (data) {
    dataset = data;
    // console.log(dataset);
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
    /*console.log(jan);
    console.log(feb);
    console.log(mar);
    console.log(apr);
    console.log(may);
    console.log(jun);
    console.log(jul);
    console.log(aug);
    console.log(sep);
    console.log(oct);
    console.log(nov);
    console.log(dec);*/
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
});

function numberWithCommas(num) {
    var n = num.toString(),
        p = n.indexOf('.');
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) {
        return p < 0 || i < p ? ($0 + ',') : $0;
    });
}

var scale = d3.scaleLinear()
    .domain([1, 12]) // Data space
    .range([3, 900]); // Pixel space


var MonthViewXaxis = d3.scaleLinear()
    .domain([1, 12])
    .range([20, 920]);

var MonthViewXscale = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

var colorScale = d3.scaleQuantile()
    .domain([13345572, 19370589])
    .range(colors);


var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([150, 0])
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
    // Bind data
    var rects = svg.selectAll("rect").data(data);

    // Enter
    rects.enter()
        .append("rect")
        .attr("y", 70)
        .attr("width", 70)
        .attr("height", 70)
        /*.attr("fill", colors[0])*/
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("class", "monthView")
        .attr("x", scale)
        .attr("id", MonthViewXscale)
        .style("fill", function (d) {
        /*console.log(colorScale(monthPassengers[d-1]));*/
        return colorScale(monthPassengers[d-1]);
        });

    //Add the SVG Text Element to the svgContainer
    var text = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text");

    //Add SVG Text Element Attributes
    var textLabels = text
        .attr("y", 50)
        .text(function (data) {
            return convertMonth(data)
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    text.attr("x", MonthViewXaxis);


}

render([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

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

//Slider
var skipSlider = document.getElementById('skipstep');

noUiSlider.create(skipSlider, {
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
    // console.log(monthArr);
    /*console.log(monthSelected);*/

    if (monthSelected.length === 12) {
        $("#selectedMonth").text("All");
    } else {
        var toPrint = ""
        for (var i = 0; i < monthSelected.length; i++) {
            toPrint += monthSelected[i];
            toPrint += ", "
        }
        $("#selectedMonth").text(toPrint.substr(0, toPrint.length - 2));
    }
    
    //PUT THE DRAWING PART HERE.
    monthArr = [start+1,end+1]
    gfx.viz.redraw("main");
    console.log(monthArr);


});


$("#Jan, #Feb, #Mar, #Apr, #May, #Jun, #Jul, #Aug, #Sep, #Oct, #Nov, #Dec").click(function (event) {
    var selectedEvent = event.target.id;
    switch (selectedEvent) {
    case "Jan":
        skipSlider.noUiSlider.set([0, 0]);
        $("#selectedMonth").text("Jan");
        break;
    case "Feb":
        skipSlider.noUiSlider.set([1, 1]);
        $("#selectedMonth").text("Feb");
        break;
    case "Mar":
        skipSlider.noUiSlider.set([2, 2]);
        $("#selectedMonth").text("Mar");
        break;
    case "Apr":
        skipSlider.noUiSlider.set([3, 3]);
        $("#selectedMonth").text("Apr");
        break;
    case "May":
        skipSlider.noUiSlider.set([4, 4]);
        $("#selectedMonth").text("May");
        break;
    case "Jun":
        skipSlider.noUiSlider.set([5, 5]);
        $("#selectedMonth").text("Jun");
        break;
    case "Jul":
        skipSlider.noUiSlider.set([6, 6]);
        $("#selectedMonth").text("Jul");
        break;
    case "Aug":
        skipSlider.noUiSlider.set([7, 7]);
        $("#selectedMonth").text("Aug");
        break;
    case "Sep":
        skipSlider.noUiSlider.set([8, 8]);
        $("#selectedMonth").text("Sep");
        break;
    case "Oct":
        skipSlider.noUiSlider.set([9, 9]);
        $("#selectedMonth").text("Oct");
        break;
    case "Nov":
        skipSlider.noUiSlider.set([10, 10]);
        $("#selectedMonth").text("Nov");
        break;
    case "Dec":
        skipSlider.noUiSlider.set([11, 11]);
        $("#selectedMonth").text("Dec");
        break;
    }

});

$("#resetMonth").click(function () {
    skipSlider.noUiSlider.set([0, 11]);
    $("#selectedMonth").text("All");
});