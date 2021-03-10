function graph_view(data_json, container_selector, tooltip_selector) {
    var container = d3.select(container_selector);
    var w = parseInt(container.node().getAttribute('width'));
    var h = parseInt(container.node().getAttribute('height'));

    var svg = container.append('svg')
        .attr('width', w)
        .attr('height', h)

    var g = svg.append('g');

    initTooltip();

    d3.json(data_json).then((data) => {
        var max_idx = Math.min(4, data.order_per_dist.length - 1);
        var max_dist = data.artworks[data.order_per_dist[max_idx]].dist_from_average;

        var node_data = [{ 'id': 'avg', 'color': data.average_color }];
        var link_data = [];
        for (let i = 0; i <= max_idx; i++) {
            var id = data.order_per_dist[i];
            var artwork_data = data.artworks[id]
            node_data.push({
                'id': id,
                'color': artwork_data.dominant_color,
                'image_url': artwork_data.url,
                'metadata': {
                    'Title': artwork_data.name,
                    'Artist': artwork_data.artist,
                    'Year': artwork_data.year
                }
            });
            link_data.push({
                'source': 'avg',
                'target': id,
                'distance': artwork_data.dist_from_average / max_dist
            });
        };

        var links = g.selectAll('line').data(link_data).enter()
            .append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        var nodes = g.selectAll('circle').data(node_data).enter()
            .append('circle')
            .attr('r', 20)
            .attr('fill', (d) => { return d.color; })
            .attr('stroke', (d) => { return d3.color(d.color).darker(1); })
            .attr('stroke-width', 1)
            .on('mouseover', function (d) { d3.select(this).attr('stroke-width', 2); displayTooltip(d); })
            .on('mouseout', function (d) { d3.select(this).attr('stroke-width', 1); hideTooltip(); });

        var forceLink = d3.forceLink()
            .id((d) => { return d.id; })
            .distance(function (d) { return d.distance * w / 2; })
            .links(link_data)

        d3.forceSimulation(node_data)
            .force('link', forceLink)
            .force('charge', d3.forceManyBody().strength(function (d, i) { return i == 0 ? -w : 0; }))
            .force('center', d3.forceCenter(w / 2, h / 2))
            .on('tick', () => {
                links.attr('x1', (d) => { return d.source.x; })
                    .attr('y1', (d) => { return d.source.y; })
                    .attr('x2', (d) => { return d.target.x; })
                    .attr('y2', (d) => { return d.target.y; });

                nodes.attr('cx', (d) => { return d.x; })
                    .attr('cy', (d) => { return d.y; });
            });
    });

    function initTooltip() {
        var w = 360;
        var h = 480;
        var tooltip = d3.select(tooltip_selector);
        tooltip
            .style('position', 'absolute')
            .style('color', 'black')
            .style('border', '1px solid black')
            .style('background', 'white')
            .style('pointer-events', 'none')
            .style('display', 'none')
            .style('padding', '8px')

        tooltip.append('table')
            .attr('class', 'table table-sm')
            .append('tbody')
        
        tooltip.append('svg')
            .attr('width', w)
            .attr('height', h * 3 / 4)
            .style('display', 'block')
            .style('margin', 'auto')
            .append('image')
            .attr('width', w)
            .attr('height', h * 3 / 4);
    };

    function displayTooltip(data) {
        if (data.id != 'avg') {
            var w = 360;
            var h = 480;
            var tooltip = d3.select(tooltip_selector);
            tooltip
                .style('left', Math.max(0, d3.event.pageX - w - 30) + 'px')
                .style('top', (d3.event.pageY - h - 30) + 'px')
                .style('width', w)
                .style('display', 'inline');

            tooltip.select('tbody').selectAll('tr')
                .data(d3.entries(data.metadata))
                .enter()
                .append('tr')
                .selectAll('td')
                .data((d) => { return [d['key'] + ':', d['value']] })
                .enter()
                .append('td')
                .text((d) => { return d });
            
            tooltip.select('svg').select('image')
                .attr('xlink:href', data.image_url);
        };
    };

    function hideTooltip() {
        var tooltip = d3.select(tooltip_selector);
        tooltip.style('display', 'none');
        tooltip.selectAll('tr').remove();
    };
};