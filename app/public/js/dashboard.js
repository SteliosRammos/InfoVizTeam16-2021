// This view is mostly just a placeholder right now...



function dashboard_view(container_selector) {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var top_border = 25
    var left_border = 50
    var width = 1280
    var height = 720

    var svg = d3.select(container_selector).append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid black')

   var chart1 = svg.append("g")
        .attr("id", "chart1")
        .attr("transform", "translate(" + 10 + "," + 10 + ")")
        .attr("width", 280 )
        .attr("height", height - 20)
        .append("rect")
        .attr('class', '.box')
        .attr("fill", 'none')
        .attr("width", 280 )
        .attr("height", height - 20)
        .style('stroke', 'black');

   var chart2 = svg.append("g")
        .attr("id", "chart2")
        .attr("transform", "translate(" + 300 + "," + 10 + ")")
        .attr("width", 490 )
        .attr("height", height/2 - 10)
        .append("rect")
        .attr("fill", 'none')
        .attr("width", 490 )
        .attr("height", height/2 - 10)
        .style('stroke', 'black');

   var chart3 = svg.append("g")
        .attr("id", "chart3")
        .attr("transform", "translate(" + 800 + "," + 10 + ")")
        .attr("width", 470 )
        .attr("height", height/2 - 10)
        .append("rect")
        .attr("fill", 'none')
        .attr("width", 470 )
        .attr("height", height/2 - 10)
        .style('stroke', 'black');

   var chart4 = svg.append("g")
        .attr("id", "chart4")
        .attr("transform", "translate(" + 300 + "," + (height/2 + 10) + ")")
        .attr("width", 490 )
        .attr("height", height/2 - 20)
        .append("rect")
        .attr("fill", 'none')
        .attr("width", 490 )
        .attr("height", height/2 - 20)
        .style('stroke', 'black');

   var chart5 = svg.append("g")
        .attr("id", "chart5")
        .attr("transform", "translate(" + 800 + "," + (height/2 + 10) + ")")
        .attr("width", 470 )
        .attr("height", height/2 - 20)
        .append("rect")
        .attr("fill", 'none')
        .attr("width", 470 )
        .attr("height", height/2 - 20)
        .style('stroke', 'black');

//     var y = d3.scaleLinear().rangeRound([0, 350]),
//     	x = d3.scaleBand().rangeRound([0,490]);
//     var map = d3.map()
//         .set("foo", 1)
//         .set("bar", 2);

//  // Code for column chart
//    var chart2=svg.append("g")
//          .data(map.entries())
//          .enter()
//          .append("rect")
//          .style('stroke', "red")
//          .attr("x", function (d) { return x(d.key)})
//          .attr("y", function (d) { return y(d.value) })
//          .attr("width", x.bandwidth())
//          .attr("height", function(d) { return 350 - y(d.value); })

//         .on("mouseover", function(d, i) {
//             var x_var = d.key;
//             var value = d.value;
//             var info = get_info_on_var(x_var);
//             var label = info[0]
//             var definition = info[1];
//
//             displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
//                 value + "%<br /><b>Explanation: </b>" + definition)
//
//             //d3.select(this).attr("fill", "DarkOrange");
//         })
//         .on("mousemove", function(d, i) {
//             var x_var = d.key;
//             var value = d.value;
//             var info = get_info_on_var(x_var);
//             var label = info[0]
//             var definition = info[1];
//
//             displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
//                 value + "%<br /><b>Explanation: </b>" + definition)
//
//             //d3.select(this).attr("fill", "DarkOrange");
//         })
//         .on("mouseout", function(d) {
//             hideTooltip();
//             //d3.select(this).attr("fill", "steelblue");
//         });


//     var g = svg.selectAll()
//                .append('g')
//                .attr('class', 'compare-item')
//                .attr('width', element_width)
//                .attr('height', element_height)
//                .attr('transform', (d, i) => { return 'translate(' + (margin.left + i * view_width / 2) + ',' + margin.top + ')' });

//        .append("g")
//            .attr("transform", "translate(" + 100 + "," + 100 + ")");


//    var	chart1 = frame
//


//    d3.json(data_endpoint + '?left=0&right=2').then((data) => {
//        var g = svg.selectAll()
//            .data(data)
//            .enter()
//            .append('g')
//            .attr('class', 'compare-item')
//            .attr('width', element_width)
//            .attr('height', element_height)
//            .attr('transform', (d, i) => { return 'translate(' + (margin.left + i * view_width / 2) + ',' + margin.top + ')' });
//
//        var table = g.append('foreignObject')
//            .attr('width', element_width)
//            .attr('height', element_height / 4)
//            .append('xhtml:body')
//            .append('table')
//            .attr('width', element_width);
//        table.append('tbody').selectAll('tr')
//            .data((d) => { return d3.entries(d['meta']) })
//            .enter()
//            .append('tr')
//            .selectAll('td')
//            .data((d) => { return [d['key'] + ':', d['value']] })
//            .enter()
//            .append('td')
//            .text((d) => { return d });
//
//        g.append('image')
//            .attr('xlink:href', (d) => { return d['image_url'] })
//            .attr('x', 0)
//            .attr('y', element_height / 4)
//            .attr('width', element_width)
//            .attr('height', element_height * 3 / 4);
//    });

//    d3.select('main').append('button')
//        .text('Randomize')
//        .on('click', () => {
//            d3.select(container_selector).selectAll('image')
//                .attr('xlink:href', (d) => { return '' });
//
//            d3.json(data_endpoint).then((data) => {
//                var g = d3.select(container_selector).selectAll('.compare-item')
//                    .data(data);
//
//                g.selectAll('tr')
//                    .data((d) => { return d3.entries(d['meta']) })
//                    .selectAll('td')
//                    .data((d) => { return [d['key'] + ':', d['value']] })
//                    .text((d) => { return d });
//
//                g.select('image')
//                    .attr('xlink:href', (d) => { return d['image_url'] })
//                    .attr('opacity', 1)
//            });
//        });
};
