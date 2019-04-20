// Function to create radar chart 

// Goal is to set it up so the input is the data values and 
// an id for that specific chart 

var RadarChart = {
    draw: function(id, d, options){

    // Set default/initial chart configuration values
        var config = {
            radius: 5,
            w: 600, 
            h: 600, 
            factor: 1, 
            factorLegend: .85, 
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.5,
            ToRight: 5,
            TranslateX: 80,
            TranslateY: 30, 
            ExtraWidthX: 100,
            ExtraWidthY: 100,
            color: d3.scale.category10()
        };

    // Replace default values with any supplied at function call
        if('undefined' !== typeof options){
            for(var i in options){
                if('undefined' !== typeof options[i]){
                    config[i] = options[i];
                }
            }
        }

    // // // // // // // // // // // // // // // // // // // // 
    // NOTE: the below may need to be altered for scaling if // 
    //       multiple charts are used                        // 
    // // // // // // // // // // // // // // // // // // // // 

    // Sets maxValue = the largest value in the provided data 
        config.maxValue = Math.max(config.maxValue, d3.max(d, i=>{
            return d3.max(i.map(o=>{return o.value;}))
        }));

    
        var allAxes = (d[0].map((i,j)=>{return i.axis}));
        var total = allAxes.length;
        var radius = config.factor*Math.min(config.w/2, config.h/2);
        var Format = d3.format('%');

        d3.select(id).select('svg').remove();

        var g = d3.select(id)
            .append('svg')
            .attr('width', config.w + config.ExtraWidthX)
            .attr('height', config.h + config.ExtraWidthY)
            .append('g')
            .attr('transform', 'translate(' + config.TranslateX + ',' + config.TranslateY + ')');

        var tooltip; 

        // Circular level segments
        for(var j=0; j<config.levels; j++){
            var levelFactor = config.factor*radius*((j+1)/config.levels);
            g.selectAll('.levels')
                .data(allAxes)
                .enter()
                .append('svg:line')
                .attr('x1', (d,i)=>{return levelFactor*(1-config.factor*Math.sin(i*config.radians/total));})
                .attr('y1', (d,i)=>{return levelFactor*(1-config.factor*Math.cos(i*config.radians/total));})
                .attr('x2', (d,i)=>{return levelFactor*(1-config.factor*Math.sin((i+1)*config.radians/total));})
                .attr('y2', (d,i)=>{return levelFactor*(1-config.factor*Math.cos((i+1)*config.radians/total));})
                .attr('class', 'line')
                .style('stroke', 'grey')
                .style('stroke-opacity', '0.75')
                .style('stroke-width', '0.3px')
                .attr('transform', 'translate(' + (config.w/2-levelFactor) + ',' + (config.h/2-levelFactor) + ')');
        }

        for(var j=0; j<config.levels; j++){
            var levelFactor = config.factor*radius*((j+1)/config.levels);
            g.selectAll('.levels')
                .data([1])
                .enter()
                .append('svg:text')
                .attr('x', function(){return levelFactor*(1-config.factor*Math.sin(0));})
                .attr('y', function(){return levelFactor*(1-config.factor*Math.cos(0));})
                .attr('class', 'legend')
                .style('font-family', 'sans-serif')
                .style('font-size', '10px')
                .attr('transform', 'translate(' + (config.w/2-levelFactor + config.ToRight) + ',' + (config.h/2-levelFactor) + ')' )
                .attr('fill', '#737373')
                .text(Format((j+1)*config.maxValue/config.levels));
        }

        series = 0;

        var axis = g.selectAll('.axis')
                    .data(allAxes)
                    .enter()
                    .append('g')
                    .attr('class', 'axis');

        // Radial lines extending from the origin
        axis.append('line')
            .attr('x1', config.w/2)
            .attr('y1', config.h/2)
            .attr('x2', (d,i)=>{return config.w/2*(1-config.factor*Math.sin(i*config.radians/total));})
            .attr('y2', (d,i)=>{return config.h/2*(1-config.factor*Math.cos(i*config.radians/total));})
            .attr('class', 'line')
            .style('stroke', 'grey')
            .style('stroke-opacity', '0.6')
            .style('stroke-width', '0.3px');

        // Radial labels 
        axis.append('text')
            .attr('class', 'legend')
            .text(d=>{return d})
            .style('font-family', 'sans-serif')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('transform', (d,i)=>{return 'translate(0, -10)'})
            .attr('x', (d,i)=>{return config.w/2*(1-config.factorLegend*Math.sin(i*config.radians/total))-60*Math.sin(i*config.radians/total);})
            .attr('y', (d,i)=>{return config.h/2*(1-Math.cos(i*config.radians/total))-20*Math.cos(i*config.radians/total);});


        d.forEach((y, x)=>{
            dataValues = [];
            g.selectAll('.nodes')
                .data(y, (j,i)=>{
                    dataValues.push([
                        config.w/2*(1-(parseFloat(Math.max(j.value, 0))/config.maxValue)*config.factor*Math.sin(i*config.radians/total)),
                        config.h/2*(1-(parseFloat(Math.max(j.value, 0))/config.maxValue)*config.factor*Math.cos(i*config.radians/total))
                    ]);
                });
            dataValues.push(dataValues[0]);

            console.log(config.color);

            g.selectAll('.area')
                .data([dataValues])
                .enter()
                .append('polygon')
                .attr('class', 'radar-chart-serie' + series)
                .style('stroke-width', '2px')
                .style('stroke', config.color(series))
                .attr('points', d=>{
                    var str='';
                    for(var pti=0; pti<d.length; pti++){
                        str=str+d[pti][0]+','+d[pti][1]+' ';
                    }
                    return str;
                })
                .style('fill', (j,i)=>{return config.color(series)})
                .style('fill-opacity', config.opacityArea)
                .on('mouseover', function(){
                    z = 'polygon.'+d3.select(this).attr('class');
                    g.selectAll('polygon')
                        .transition(200)
                        .style('fill-opacity', 0.1);
                    g.selectAll(z)
                        .transition(200)
                        .style('fill-opacity', 0.7);
                })
                .on('mouseout', function(){
                    g.selectAll('polygon')
                        .transition(200)
                        .style('fill-opacity', config.opacityArea);
                });
            series++;    
        });

        series=0;


        d.forEach((y,x)=> {
            g.selectAll('.nodes')
                .data(y).enter()
                .append('svg:circle')
                .attr('class', 'radar-chart-serie'+series)
                .attr('r', config.radius)
                .attr('alt', j=>{return Math.max(j.value, 0)})
                .attr('cx', (j,i)=>{
                    dataValues.push([
                        config.w/2*(1-(parseFloat(Math.max(j.value, 0))/config.maxValue)*config.factor*Math.sin(i*offscreenBuffering.radians/total)),
                        config.h/2*(1-(parseFloat(Math.max(j.value, 0))/config.maxValue)*config.factor*Math.cos(i*config.radians/total))
                    ]);
                    return config.w/2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.sin(i*config.radians/total));
                })
                .attr('cy', (j,i)=>{
                    return config.h/2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.cos(i*config.radians/total));
                })
                .attr('data-id', j=>{return j.axis})
                .style('fill', config.color(series)).style('fill-opacity', 0.9)
                .on('mouseover', d=>{
                    newX = parseFloat(d3.select(this).attr('cs'))-10;
                    newY = parseFloat(d3.select(this).attr('cy'))-5;

                    tooltip
                        .attr('x', newX)
                        .attr('y', newY)
                        .text(Format(d.value))
                        .transition(200)
                        .style('opacity', 1);

                    z = 'polygon.'+d3.select(this).attr('class');

                    g.selectAll('polygon')
                        .transition(200)
                        .style('fill-opacity', 0.1);
                    
                    g.selectAll(z)
                        .transition(200)
                        .style('fill-opacity', 0.7);
                })
                .on('mouseout', function(){
                    tooltip
                        .transition(200)
                        .style('opacity', 0)
                    g.selectAll('polygon')
                        .transition(200)
                        .style('fill-opacity', config.opacityArea);
                })
                .append('svg:title')
                .text(j=>{return Math.max(j.value, 0)});
            series++;
        });

        // Tooltip
        tooltip = g.append('text')
                    .style('opacity', 0)
                    .style('font-family', 'sans-serif')
                    .style('font-size', '13px');
        

    }
}