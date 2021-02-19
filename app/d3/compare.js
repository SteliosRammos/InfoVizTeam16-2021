// This view is mostly just a placeholder right now...

compare_view = (data, div_id) => {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var view_width = 960;
    var view_height = 480;
    var element_width = view_width / 2 - margin.left - margin.right;
    var element_height = view_height - margin.top - margin.bottom;

    var svg = d3.select(div_id).append('svg')
        .attr('width', view_width)
        .attr('height', view_height)
        .attr('id', 'compare-view')
        .style('border', '1px solid black')

    var g = svg.selectAll('#compare-view')
        .data(data)
        .enter()
        .append('g')
        .attr('width', element_width)
        .attr('height', element_height)
        .attr('transform', (d, i) => { return 'translate(' + (margin.left + i * view_width / 2) + ',' + margin.top + ')' });

    var table = g.append('foreignObject')
        .attr('width', element_width)
        .attr('height', element_height / 4)
        .append('xhtml:body')
        .append('table')
        .attr('width', element_width);
    table.append('tbody').selectAll('tr')
        .data((d) => { return d3.entries(d['meta']) })
        .enter()
        .append('tr')
        .selectAll('td')
        .data((d) => { return [d['key'] + ':', d['value']] })
        .enter()
        .append('td')
        .text((d) => { return d });

    g.append('image')
        .attr('xlink:href', (d) => { return d['image_url'] })
        .attr('x', 0)
        .attr('y', element_height / 4)
        .attr('width', element_width)
        .attr('height', element_height * 3 / 4);
};
