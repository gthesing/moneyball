
// Radar chart call(s)

// dummy data; remember these will be a percentage of max
// update to call sqlite endpoint
var defaultData = [
    // Playoff Team Averages
    [
        {axis:'Runs Scored',value:0.71},
        {axis:'Runs Allowed',value:0.39},
        {axis:'Batting Average',value:0.43},
        {axis:'On-base Percentage',value:0.93},
        {axis:'Slugging Percentage',value:0.85},
        {axis:'Wins',value:0.72}
    ],
    // League Averages
    [
        {axis:'Runs Scored',value:0.5},
        {axis:'Runs Allowed',value:0.42},
        {axis:'Batting Average',value:0.17},
        {axis:'On-base Percentage',value:0.67},
        {axis:'Slugging Percentage',value:0.99},
        {axis:'Wins',value:0.43}
    ] 
];

// Create Labels for datasets
var LegendLabels = ['Average Playoff Team', 'Your Input'];

// In case any config values need changing
newConfig = {
    TranslateX: 50, 
};
// Function call; give descriptive id names to each
RadarChart.draw('#radar-chart', defaultData, newConfig);


// Updating the radar chart with new data
var submit = d3.select('#btn');

submit.on('click', function() {

    d3.event.preventDefault();

    var inputRS  = d3.select('input#RS' ).property('value');
    var inputRA  = d3.select('input#RA' ).property('value');
    var inputBA  = d3.select('input#BA' ).property('value');
    var inputOBP = d3.select('input#OBP').property('value');
    var inputSLG = d3.select('input#SLG').property('value');
    var inputW   = d3.select('input#W'  ).property('value');

    var allInputs = [
        inputRS, inputRA, inputBA, inputOBP, inputSLG, inputW
    ]; 

    // Set input variable to default if no user input 
    for(var i=0; i<allInputs.length; i++){
        if (allInputs[i] == ''){
            allInputs[i] = defaultData[1][i]['value'];
        }
    }; 

    var userInputData = [

        defaultData[0], 

        [
            {axis:'Runs Scored',value:allInputs[0]},
            {axis:'Runs Allowed',value:allInputs[1]},
            {axis:'Batting Average',value:allInputs[2]},
            {axis:'On-base Percentage',value:allInputs[3]},
            {axis:'Slugging Percentage',value:allInputs[4]},
            {axis:'Wins',value:allInputs[5]}
        ]
    ];

    RadarChart.draw('#radar-chart', userInputData, newConfig);

})

