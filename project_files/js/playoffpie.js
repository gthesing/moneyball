var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = Math.min(width, height) / 2;

var g = svg.append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

var pie = d3.pie().value(function(d) { 
    return d.Playoff_Appearances; 
});

var path = d3.arc()
         .outerRadius(radius - 10)
         .innerRadius(0);

var label = d3.arc()
          .outerRadius(radius)
          .innerRadius(radius - 80);

d3.json("/playoffs", function(error, data) {

    if (error) throw error;

    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        // .attr("fill", function(d) { return color(d.data.Team); });

    console.log(arc)

    arc.append("text")
    .attr("transform", function(d) { 
        return "translate(" + label.centroid(d) + ")"; 
    })
    .text(function(d) { return d.data.Team; });

    svg.append("g")
        .attr("transform", "translate(" + (width / 2 - 120) + "," + 20 + ")")
        .append("text")
        .text("Number of playoff appearances by team")
        .attr("class", "title")

      // Step 1: Initialize Tooltip
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([0,0])
        .html(function(d) {
          return (`<strong> Team: ${(d.Team)},<strong><hr>${d.Playoff_Appearances}
          playoff appearances`);
        });

      // Step 2: Create the tooltip in chartGroup.
      chartGroup.call(toolTip);

      // Step 3: Create "mouseover" event listener to display tooltip
      circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
      })
      // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
          toolTip.hide(d);
        });

});

