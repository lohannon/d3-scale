function weightScaleChart(){
    //constants
    var DOMAIN_MAX = 100;
    var DOMAIN_MIN = 0;
    var DRAGGABLE_WIDTH = 10;
    //defaults
    var legend = false;
    var legendHeight = 0;
    var width = 960;
    var chartHeight = 300;
    var colors = d3.scale.category10().range();
    var fontSize = 16;

    function chart(selection){
        selection.each(function(data, i){
            var select = this;
            //update data with start and stop x values
            var x0 = 0;
            data = data.map(function(d, index) {
                return {
                    category: d.category,
                    weight: d.weight,
                    x0: x0,
                    x1: x0 += d.weight,
                    id: index
                };
            });

            //set scales
            var x = d3.scale.linear()
                .rangeRound([0, width]);
            var color = d3.scale.ordinal()
                .range(colors);

            //set domains
            x.domain([DOMAIN_MIN, DOMAIN_MAX]);
            color.domain(data.map(function(d) { return d.category;}));

            //events
            var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("drag", dragmove)
                .on("dragend", dragReset);

            //construct svg elements for chart
            //________________________________

            function drawChart(s){
                var svg = d3.select(s).append("svg")
                    .attr("width", width)
                    .attr("height", chartHeight)
                    .append("g");

                var bars = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("g");

                //bars of weight percentages
                var percentBars = bars.append("rect")
                    .attr("class", "bar")
                    .attr("id", function(d) { return "bar-" + d.id;} )
                    .attr("x", function(d) { return x(d.x0); })
                    .attr("width", function(d) { return x(d.weight); })
                    .attr("y", chartHeight * 0.25)
                    .attr("height", chartHeight/2)
                    .style("fill", function(d) { return color(d.category); });
                //draggable bars
                var dragBars = bars.append("rect")
                    .attr("class", "draggable")
                    .attr("id", function(d) { return "drag-bar-" + d.id;} )
                    .attr("x", function(d) { return x(d.x1) - DRAGGABLE_WIDTH; } )
                    .attr("width", 10)
                    .attr("y", chartHeight * 0.25 - chartHeight * 0.05)
                    .attr("height", chartHeight/2 + chartHeight * 0.05)
                    .style("fill", function(d) { return d.x1 == d.x0 ? "none" : d3.rgb(color(d.category)).darker(0.25).toString(); })
                    .call(drag);
                //text
                var barText = bars.append("text")
                    .attr("class", "text")
                    .style("font-size", fontSize)
                    .attr("id", function(d) { return "text-bar-" + d.id;} )
                    .attr("x", function(d) { return x(d.x1) - fontSize; })
                    .attr("y", chartHeight/2)
                    .attr("dy", ".35em")
                    .text(function(d) { return x(d.x1 - d.x0) > (fontSize*4) ? d.weight.toFixed(1) + "%": ""; });

                //legend
                if(legend){
                    var legendItemHeight = 20;
                    var minLegendColumnWidth = 260;
                    var numLegendItemsPerColumn = legendHeight/legendItemHeight;
                    var numLegendColumns = Math.ceil(data.length/numLegendItemsPerColumn);
                    numLegendColumns = Math.min(numLegendColumns, Math.floor(width/minLegendColumnWidth));
                    var legendColumnWidth = Math.floor(width/numLegendColumns);

                    var legendSvg = d3.select(s).append("svg")
                        .attr("width", width)
                        .attr("height", legendHeight)
                        .attr("transform", "translate(0," + chartHeight + ")");

                    for(var col = 0; col < numLegendColumns; col++){
                        var legendColumn = legendSvg.append("g")
                            .attr("class","legend")
                            .attr("width", legendColumnWidth - 10)
                            .attr("height", legendHeight)
                            .attr("transform", "translate(" + (col*(legendColumnWidth+10) + 5) + ",0)")
                            .selectAll("g")
                            .data(data.slice(col*numLegendItemsPerColumn, Math.min(data.length, (col+1)*numLegendItemsPerColumn)))
                            .enter().append("g")
                            .attr("transform", function(d, i) { return "translate(0," + i * legendItemHeight + ")"});
                        legendColumn.append("rect")
                            .attr("width", legendItemHeight - 2)
                            .attr("height", legendItemHeight - 2)
                            .style("fill", function(d) { return color(d.category); });
                        legendColumn.append("text")
                            .attr("x", legendItemHeight + 4)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .text(function(d) { return d.category; });
                        legendColumn.append("text")
                            .attr("id", function(d) { return "text-legend-" + d.id;} )
                            .attr("x", minLegendColumnWidth - 60)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .text(function(d) { return d.weight.toFixed(1) + "%" });
                    }
                }
            }


            //event handlers
            function dragmove(d, i){
                if (i < data.length - 1){
                    var max = data[i+1].x1;
                    var min = Math.max(DOMAIN_MIN, d.x0);
                    var x1 = Math.max(min, Math.min(max, d.x1 + x.invert(d3.event.dx)));
                    //move drag bar
                    d3.select(this)
                        .attr("x", x(d.x1 = x1) - DRAGGABLE_WIDTH);
                    //adjust weight rectangle
                    d3.select($(this).prev()[0])
                        .attr("width", x(d.weight = d.x1 - d.x0));
                    //change text to represent weight
                    d3.select($(this).next()[0])
                        .attr("x", function(d) { return x(d.x1) - 15})
                        .text(function(d) { return x(d.weight) > (fontSize*4)  ? d.weight.toFixed(1) + "%": "";});
                    //change neighbor to the right
                    var neighbor = $(this).closest("g").next();
                    var neighborData = data[i+1];
                    //adjust weight rectangle
                    d3.select(neighbor.find('.bar')[0])
                        .attr("x", x(neighborData.x0 = d.x1))
                        .attr("width", x(neighborData.weight = neighborData.x1 - neighborData.x0));
                    //change neighbor text to represent weight
                    d3.select(neighbor.find('text')[0])
                        .text(x(neighborData.weight) > (fontSize*4) ? neighborData.weight.toFixed(1) + "%": "");
                    //if neighbor is now weighted at 0, then neighbor drag bar should be invisible
                    d3.select(neighbor.find('draggable')[0])
                        .style("fill", function(n){ console.log(neighborData); console.log(neighborData.x1 == neighborData.x0);return neighborData.x1 == neighborData.x0 ? "none" : d3.rgb(color(d.category)).darker(0.25).toString();})

                    if(legend){
                        //get legend element corresponding to dragged element
                        d3.select($('#text-legend-' + i)[0])
                            .text(function(d) { return d.weight.toFixed(1) + "%" });
                        d3.select($('#text-legend-' + (i+1))[0])
                            .text(function(d) { return d.weight.toFixed(1) + "%" });
                    }
                }
            }

            function dragReset(){
                d3.select(select).selectAll("svg").remove();
                drawChart(select);
            }

            drawChart(select);
        });
    }

    chart.width = function(value){
        if(!arguments.length) return width;
        else width = value;
        return chart;
    }

    chart.height = function(value){
        if(!arguments.length) return chartHeight;
        else {
            chartHeight = value;
            fontSize = Math.min(16, chartHeight*0.5);
        }
        return chart;
    }

    chart.colors = function(value){
        if(!arguments.length) return colors;
        else colors = value;
        return chart;
    }
    chart.legend = function(value){
        if(!arguments.length) return legend;
        else legend = value;
        if (legend)
            legendHeight = legendHeight || Math.min(chartHeight, 300);
        else
            legendHeight = 0;
        return chart;
    }
    chart.legendHeight = function(value){
        if(!arguments.length) return legendHeight;
        else legendHeight = value;
        return chart;
    }

    return chart;
}