// Define SVG area dimensions
var svgWidth = 1300;
var svgHeight = 700;

// Define the chart's margins as an object
var margin = {
  top: 140,
  right: 80,
  bottom: 140,
  left: 120
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Configure a parseTime function which will return a new Date object from a string
var parseTime = d3.timeParse("%Y");


function buildPlot(stat){
    // Load data
    var statURL = "/stats/" + stat;
    d3.json(statURL).then(function(statsData) {

        // Format the date and cast the miles value to a number
        statsData.forEach(function(data) {
            data.Year = parseTime(data.Year);
            data.Average = +data.Average;
            // console.log(data.Year);
        });

        // Configure a time scale with a range between 0 and the chartWidth
        var xTimeScale = d3.scaleTime()
            .range([0, chartWidth])
            .domain(d3.extent(statsData, data => data.Year));

        // Configure a linear scale with a range between the chartHeight and 0
        var yLinearScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([.99*(d3.min(statsData, data => data.Average)), d3.max(statsData, data => data.Average)]);

        // Create two new functions passing the scales in as arguments
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
            // .style("fill","none")
            .attr("d", drawLine(statsData))
            .attr("stroke","black")
            .attr("stroke-width", "2")
            .attr("fill", "none")
            .classed("line", true);
        // Append an SVG group element to the SVG area, create the left axis inside of it
        chartGroup.append("g")
            .classed("axis", true)
            .attr("stroke-width", "2")
            .call(leftAxis);

        // Append an SVG group element to the SVG area, create the bottom axis inside of it
        chartGroup.append("g")
            .classed("axis", true)
            .attr("stroke-width", "2")
            .attr("transform", "translate(0, " + chartHeight + ")")
            .call(bottomAxis);

        // //Tool tip

        // var toolTip = d3.select("body")
        //     .attr("class","tooltip")
        //     .offset([-10,-50])
        //     .html(function(d){
        //            return("Year: " + d.Year + "Average " + stat + ": " + d.Average);
        //        });
           
        // chartGroup.call(toolTip);
   
        //    // Event Listeners
        // chartGroup.on("mouseover", function(d){
        //        toolTip.show(d,this);
        //    })
        //        .on("mouseout", function(d){
        //            toolTip.hide(d);
        //        });




        // Axis Labels & Title

        chartGroup.append("text")
            .attr("x", (chartWidth /2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("text-decoration", "underline")
            .text("Average " + stat + " to Make the Playoffs")


        chartGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - margin.left +15)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .style("text-anchor","middle")
            .text("Average " + stat);
        
        chartGroup.append("text")
            .attr("y",chartHeight + 45)
            .attr("x",chartWidth/2)
            .attr("class", "axisText")
            .style("text-anchor","middle")
            .text("Year");

    })
};

document.getElementById("selDataset").onchange = function() {newPlot()};

function newPlot(){
    var stats = d3.select("#selDataset").node().value;
    buildPlot(stats);
}

// // Submit Button handler
// function handleSubmit() {
//     // Prevent the page from refreshing
//     d3.event.preventDefault();
  
//     // Select the input value from the form
//     var stat = d3.select("#selDataset").node().value;
//     console.log(stat);
  
//     // clear the input value
//     d3.select("#selDataset").node().value = "";
  
//     // Build the plot with the new year
//     buildPlot(stat);
//   }