
// Radar chart call(s)

var colorscale = d3.scale.category10();
var LegendOptions = ['Average Playoff Team', 'Input'];

// dummy data; remember these will be a percentage of max
var dummyData = [
    // Average playoff team
    [
        {axis:'Runs Scored',value:0.71},
        {axis:'Runs Allowed',value:0.39},
        {axis:'Batting Average',value:0.43},
        {axis:'On-base Percentage',value:0.93},
        {axis:'Slugging Percentage',value:0.85},
        {axis:'Wins',value:0.72}
    ],
    [
        {axis:'Runs Scored',value:0.5},
        {axis:'Runs Allowed',value:0.42},
        {axis:'Batting Average',value:0.17},
        {axis:'On-base Percentage',value:0.67},
        {axis:'Slugging Percentage',value:0.99},
        {axis:'Wins',value:0.43}
    ] 
]

// In case any config values need changing
newConfig = {};

// Function call; give descriptive id names to each
RadarChart.draw('#radar-chart', dummyData, newConfig);


