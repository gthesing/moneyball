
// Radar chart call(s)

d3.json('/alltime_playoff', function(playoff_data){
    d3.json('/alltime_max', function(max_data){

        // In case any config values need changing
        newConfig = {
            TranslateX: 50, 
            LegendLabels: ['Average Playoff Team', 'Your Input']
        };

        var RSmax =  max_data[0]['RS'],
            RAmax =  max_data[0]['RA'],
            BAmax =  max_data[0]['BA'],
            OBPmax = max_data[0]['OBP'],
            SLGmax = max_data[0]['SLG'],
            Wmax =   max_data[0]['W'];

        // sqlite data from app endpoint
        var defaultData = [
            // Playoff Team Averages
            [
                {axis:'Runs Scored',value:playoff_data[0]['RS']/RSmax},
                {axis:'Runs Allowed',value:playoff_data[0]['RA']/RAmax},
                {axis:'Batting Average',value:playoff_data[0]['BA']/BAmax},
                {axis:'On-base Percentage',value:playoff_data[0]['OBP']/OBPmax},
                {axis:'Slugging Percentage',value:playoff_data[0]['SLG']/SLGmax},
                {axis:'Wins',value:playoff_data[0]['W']/Wmax}
            ],
            // Default user input data;
            [
                {axis:'Runs Scored',value:0.5},
                {axis:'Runs Allowed',value:0.78},
                {axis:'Batting Average',value:0.58},
                {axis:'On-base Percentage',value:0.67},
                {axis:'Slugging Percentage',value:0.51},
                {axis:'Wins',value:0.43}
            ]
        ];

        // Function call; give descriptive id names to each
        RadarChart.draw('#radar-chart', defaultData, newConfig);

        // NEW

        //SVG setup 
        var svggWidth = 900;
        var svggHeight = 500;

        var marginn = {
            top: 50,
            right: 50,
            bottom: 3000,
            left: 100
        };

        var svgg = d3.select('#buffer')
                .append('svg')
                .attr('width', svggWidth)
                .attr('height', svggHeight);

        var chartGroup = svgg.append('g')
            .attr('transform', `translate(${marginn.left}, ${marginn.top})`)
            .attr('id', 'chartGroup');

        // END NEW


        // Updating the radar chart with new data
        var submit = d3.select('#btn');

        submit.on('click', function() {

            d3.event.preventDefault();

            var inputRS  = d3.select('input#RS' ).property('value') / RSmax;
            var inputRA  = d3.select('input#RA' ).property('value') / RAmax;
            var inputBA  = d3.select('input#BA' ).property('value') / BAmax;
            var inputOBP = d3.select('input#OBP').property('value') / OBPmax;
            var inputSLG = d3.select('input#SLG').property('value') / SLGmax;
            var inputW   = d3.select('input#W'  ).property('value') / Wmax;

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
    })
});








