
// Submit Button handler
function handleSubmit() {
  // Prevent the page from refreshing
  d3.event.preventDefault();

  // Select the input value from the form
  var RS = d3.select("#RS").node().value;
  var RA = d3.select("#RA").node().value;
  var W = d3.select("#W").node().value;
  var OBP = d3.select("#OBP").node().value;
  var SLG = d3.select("#SLG").node().value;
  var BA = d3.select("#BA").node().value;
  console.log(RS);
  console.log(RA);
  console.log(W);
  console.log(OBP);
  console.log(SLG);
  console.log(BA);

  // clear the input value
  // d3.select("#RS").node().value = "";

  // Build the plot with the new year
  // buildPlot(year);
}

// function buildPlot(year) {

//   var yearURL = "/"+year;
//   d3.json(yearURL).then(function(yearData) {
//     var disease_name = [];
//     var disease_count = [];
//     for (var i = 0; i < yearData.length; i++) { 
//       disease_name.push(yearData[i].Disease);
//       disease_count.push(yearData[i].Count);
//     };  
//      console.log(disease_count);
//       var trace1 = {
//         x: disease_name,
//         y: disease_count,
//         type: "bar"
//      };
    
//       var data = [trace1];
//       var layout = {
//         title: "Disease Count for " + year,
//         xaxis: { title: "Diseases"},
//         yaxis: { title: "Case Count"}
//       };
//        Plotly.newPlot("plot", data,layout);
    
//   })  
    
// };
  
d3.select("#submit").on("click", handleSubmit);