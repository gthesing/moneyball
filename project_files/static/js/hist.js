//SVG setup 
var svgWidth = 900;
var svgHeight = 500;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select('#hist')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('id', 'chartGroup');


// Initial conditions
var chosenXAxis = 'BA';
var binNum = 15;
var binWidth = 0.95*(width/binNum);
var labelSpacing = 20;



// function to get list of bin tick mark labels
function getBinTicks(chosenXAxis, histData){
    var min = d3.min(histData[chosenXAxis]);
    var max = d3.max(histData[chosenXAxis]);
    binTicks = [];
    bin_range = (max-min)/binNum;
    for (var i=0; i<binNum+1; i++){
        var t = (min+(bin_range*i)).toFixed(3);
        binTicks.push(t);
    };   
    return binTicks; 
};

// function that returns JSON object with bin/frequency data
function updateBinData(chosenXAxis, binNum, histData){
    binTicks = getBinTicks(chosenXAxis, histData);
    var freqCount = [];
    for (var j=0; j<binNum; j++){
        var count = 0;
        histData[chosenXAxis].forEach(d=>{
            if (d>binTicks[j]){
                if (d<=binTicks[j+1]){
                    count = count + 1;
                }
            }
        });
        var c = {'bin': j+1, 'freq': count};
        freqCount.push(c);
    };
    freqCount[0]['freq'] = freqCount[0]['freq']+1  //have to do this to count the min
    return freqCount;
};

// function to update chart scale based on input
function xScale(binTicks){
    tickLocs = [];
    for (var i=0; i<binNum+1; i++){
        tickLocs.push((width/binNum)*(i));
    }
    var xOrdinalScale = d3.scaleOrdinal()
        .domain(binTicks)
        .range(tickLocs);    // reference this when placing bars
    return xOrdinalScale;
};
function yScale(binData){
    ticks = [];
    binData.forEach(d=>{ticks.push(d['freq']);});
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(ticks)*1.1])
        .range([height, 0]);
    return yLinearScale;
};

// Function to create and update labels
function createXLabels(xLabelsGroup){
// Appending individual labels
    var BAlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('value', 'BA')
        .attr('id', 'BA')
        .classed('active', true).classed('inactive', false)
        .text('Batting Average');
    var RSlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', labelSpacing)
        .attr('value', 'RS')
        .attr('id', 'RS')
        .classed('active', false).classed('inactive', true)
        .text('Runs Scored');
    var RAlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', labelSpacing*2)
        .attr('value', 'RA')
        .attr('id', 'RA')
        .classed('active', false).classed('inactive', true)
        .text('Runs Allowed');
    var Wlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', labelSpacing*3)
        .attr('value', 'W')
        .attr('id', 'W')
        .classed('active', false).classed('inactive', true)
        .text('Wins');
    var OBPlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', labelSpacing*4)
        .attr('value', 'OBP')
        .attr('id', 'OBP')
        .classed('active', false).classed('inactive', true)
        .text('On-Base Percentage');
    var SLGlabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', labelSpacing*5)
        .attr('value', 'SLG')
        .attr('id', 'SLG')
        .classed('active', false).classed('inactive', true)
        .text('Slugging Percentage');
    return xLabelsGroup;
};

// Meat and Potatoes time
d3.json('/all_stats_hist').then(function(data){

    var histData = data[0];

    binData = updateBinData(chosenXAxis, binNum, histData);
    binTicks = getBinTicks(chosenXAxis, histData);

    // render axes and scale(?)
    // call xScale and yScale functions 
    var xOrdinalScale = xScale(binTicks);
    var yLinearScale = yScale(binData);

    // create initial axes
    var bottomAxis = d3.axisBottom(xOrdinalScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append axes
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    // create and append bars
    var barGroup = chartGroup.selectAll('.bar')
        .data(binData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d=>{return xOrdinalScale(d.bin)+0.001*width})
        .attr('y', d=>{return yLinearScale(d.freq)})
        .attr('height', d=>{return height-yLinearScale(d.freq)})
        .attr('width', binWidth); 
    
    var barLabelGroup = chartGroup.selectAll('.bar-label')
        .data(binData)
        .enter()
        .append('text')
        .text(d=>d.freq)
        .classed('bar-label', true)
        .attr('x', d=>{return xOrdinalScale(d.bin)+(0.5*binWidth)})
        .attr('y', d=>{return yLinearScale(d.freq)-4});

    // X Axis Labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width*0.85},20)`);
    
    xLabelsGroup = createXLabels(xLabelsGroup);
    
    var toolTip = d3.tip()
            .attr('class', 'd3-tip')
            .direction('e')
            .offset([0,5])
            .html(d=>{return (`${d.freq}`)});

    barGroup.call(toolTip);
    barGroup.on('mouseenter', d=>{toolTip.show(d);});
    barGroup.on('mouseleave', d=>{toolTip.hide(d);});


    // UPDATING

    xLabelsGroup.selectAll('text').on('click', function() {

        var value = d3.select(this).attr('value');

        if (value !== chosenXAxis){

            // chartGroup.selectAll('*').remove();
            chartGroup.selectAll('.x-axis').remove();
            chartGroup.selectAll('.y-axis').remove();
            chartGroup.selectAll('.bar').remove();
            chartGroup.selectAll('.bar-label').remove();

            chosenXAxis = value;

            binData = updateBinData(chosenXAxis, binNum, histData);
            binTicks = getBinTicks(chosenXAxis, histData);
            xOrdinalScale = xScale(binTicks);
            yLinearScale = yScale(binData);
            bottomAxis = d3.axisBottom(xOrdinalScale);
            leftAxis = d3.axisLeft(yLinearScale);

            var xAxis = chartGroup.append('g')
                .classed('x-axis', true)
                .attr('transform', `translate(0, ${height})`)
                .call(bottomAxis);
            var yAxis = chartGroup.append('g')
                .classed('y-axis', true)
                .call(leftAxis);

            var barGroup = chartGroup.selectAll('.bar')
                .data(binData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d=>{return xOrdinalScale(d.bin)+0.001*width})
                .attr('y', d=>{return yLinearScale(d.freq)})
                .attr('height', d=>{return height-yLinearScale(d.freq)})
                .attr('width', binWidth);

            var barLabelGroup = chartGroup.selectAll('.bar-label')
                .data(binData)
                .enter()
                .append('text')
                .text(d=>d.freq)
                .classed('bar-label', true)
                .attr('x', d=>{return xOrdinalScale(d.bin)+(0.5*binWidth)})
                .attr('y', d=>{return yLinearScale(d.freq)-4});
            
            if (chosenXAxis === 'BA'){
                d3.select('#BA' ).classed('active', true).classed('inactive', false);
                d3.select('#RS' ).classed('active', false).classed('inactive', true);
                d3.select('#RA' ).classed('active', false).classed('inactive', true);
                d3.select('#W'  ).classed('active', false).classed('inactive', true);
                d3.select('#OBP').classed('active', false).classed('inactive', true);
                d3.select('#SLG').classed('active', false).classed('inactive', true);
            } else if (chosenXAxis === 'RS'){
                d3.select('#RS' ).classed('active', true).classed('inactive', false);
                d3.select('#BA' ).classed('active', false).classed('inactive', true);
                d3.select('#RA' ).classed('active', false).classed('inactive', true);
                d3.select('#W'  ).classed('active', false).classed('inactive', true);
                d3.select('#OBP').classed('active', false).classed('inactive', true);
                d3.select('#SLG').classed('active', false).classed('inactive', true);
            } else if (chosenXAxis === 'RA'){
                d3.select('#RA' ).classed('active', true).classed('inactive', false);
                d3.select('#RS' ).classed('active', false).classed('inactive', true);
                d3.select('#BA' ).classed('active', false).classed('inactive', true);
                d3.select('#W'  ).classed('active', false).classed('inactive', true);
                d3.select('#OBP').classed('active', false).classed('inactive', true);
                d3.select('#SLG').classed('active', false).classed('inactive', true);
            } else if (chosenXAxis === 'W'){
                d3.select('#W'  ).classed('active', true).classed('inactive', false);
                d3.select('#RS' ).classed('active', false).classed('inactive', true);
                d3.select('#BA' ).classed('active', false).classed('inactive', true);
                d3.select('#RA' ).classed('active', false).classed('inactive', true);
                d3.select('#OBP').classed('active', false).classed('inactive', true);
                d3.select('#SLG').classed('active', false).classed('inactive', true);
            } else if (chosenXAxis === 'OBP'){
                d3.select('#OBP').classed('active', true).classed('inactive', false);
                d3.select('#RS' ).classed('active', false).classed('inactive', true);
                d3.select('#BA' ).classed('active', false).classed('inactive', true);
                d3.select('#RA' ).classed('active', false).classed('inactive', true);
                d3.select('#W'  ).classed('active', false).classed('inactive', true);
                d3.select('#SLG').classed('active', false).classed('inactive', true);
            } else {
                d3.select('#SLG').classed('active', true).classed('inactive', false);
                d3.select('#RS' ).classed('active', false).classed('inactive', true);
                d3.select('#BA' ).classed('active', false).classed('inactive', true);
                d3.select('#RA' ).classed('active', false).classed('inactive', true);
                d3.select('#W'  ).classed('active', false).classed('inactive', true);
                d3.select('#OBP').classed('active', false).classed('inactive', true);
            };
    
        }

    });
    
});
