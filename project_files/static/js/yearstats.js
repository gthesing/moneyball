// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("chart_3")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Configure a parseTime function which will return a new Date object from a string
var parseTime = d3.timeParse("%Y");


function buildPlot(stat)
    // Load data
    d3.json("/stats/"+stat, function(statsData) {


    // Format the date and cast the miles value to a number
    statsData.forEach(function(data) {
        data.Year = parseTime(data.Year);
        data.Average = +data.Average;
    });

    // Configure a time scale with a range between 0 and the chartWidth
    // Set the domain for the xTimeScale function
    // d3.extent returns the an array containing the min and max values for the property specified
    var xTimeScale = d3.scaleTime()
        .range([0, chartWidth])
        .domain(d3.extent(statsData, data => data.Year));

    // Configure a linear scale with a range between the chartHeight and 0
    // Set the domain for the xLinearScale function
    var yLinearScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, d3.max(statsData, data => data.Average)]);

    // Create two new functions passing the scales in as arguments
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xTimeScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Configure a drawLine function which will use our scales to plot the line's points
    var drawLine = d3
        .line()
        .x(data => xTimeScale(data.Year))
        .y(data => yLinearScale(data.Average));

    // Append an SVG path and plot its points using the line function
    chartGroup.append("path")
        // The drawLine function returns the instructions for creating the line for statsData
        .attr("d", drawLine(statsData))
        .classed("line", true);

    // Append an SVG group element to the SVG area, create the left axis inside of it
    chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);

    // Append an SVG group element to the SVG area, create the bottom axis inside of it
    // Translate the bottom axis to the bottom of the page
    chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", "translate(0, " + chartHeight + ")")
        .call(bottomAxis);
    });

// Submit Button handler
function handleSubmit() {
    // Prevent the page from refreshing
    d3.event.preventDefault();
  
    // Select the input value from the form
    var stat = d3.select("#stat").node().value;
    console.log(stat);
  
    // clear the input value
    d3.select("#stat").node().value = "";
  
    // Build the plot with the new year
    buildPlot(stat);
  }