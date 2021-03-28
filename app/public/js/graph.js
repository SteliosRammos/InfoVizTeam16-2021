var graph_width = 480;
var graph_height = 480;
var graph_globals = {
    'node_data': [],
    'link_data': [],
    'nodes': 10,
    'max_nodes': 20
}

function graph_view() {

    init_help();
    const help_text = 'Distance from average: after selecting a cube in the RGB space, this graph will show the average color in that cube and the 10 closest artworks to that average';

    var help_button = d3.select(GRAPH).append('span')
    .attr('class', "material-icons-outlined")
    .text('help_outline')
    .on('mouseover', () => { show_help(help_text); })
    .on('mouseout', () => { hide_help(); });

    var svg = d3.select(GRAPH).append('svg')
        .attr('width', graph_width)
        .attr('height', graph_height);
    
    svg.append('g').attr('id', 'links')
    svg.append('g').attr('id', 'nodes')
    svg.append('g').attr('id', 'link_text')

    var graph_slider = d3.select(GRAPH).append('div').attr('id', 'graph-slider');
    var slider = createD3SimpleSlider(1, graph_globals.max_nodes, "#graph-slider");
    var init_nodes = 10;
    slider.select(init_nodes);
    slider.onChange(function (newPos) {
        d3.select("#graph-slider-label").text(newPos + ' node' + (newPos > 1 ? 's' : ''));
        pos = slider.select();
        graph_globals.nodes = 0;
        update_graph();
        graph_globals.nodes = pos;
        update_graph();
    });
    graph_slider.append('div').attr('id', 'graph-slider-label').text(init_nodes + ' nodes');

    init_tooltip();
};

function update_graph(data = null) {
    if (data !== null) {
        if (typeof data.order_per_dist == "undefined") {
            return
        }
        var max_idx = Math.min(graph_globals.max_nodes - 1, data.order_per_dist.length - 1);
        var max_dist = data.artworks[data.order_per_dist[max_idx]].dist_from_average;

        graph_globals.node_data = [{ 'id': 'avg', 'color': data.average_color }];
        graph_globals.link_data = [];
        for (let i = 0; i <= max_idx; i++) {
            var id = data.order_per_dist[i];
            var artwork_data = data.artworks[id]
            graph_globals.node_data.push({
                'id': id,
                'color': artwork_data.dominant_color,
                'image_url': artwork_data.url,
                'metadata': {
                    'Title': artwork_data.name,
                    'Artist': artwork_data.artist,
                    'Year': Math.floor(artwork_data.year)
                }
            });
            graph_globals.link_data.push({
                'source': 'avg',
                'target': id,
                'distance': max_dist == 0 ? 1 : artwork_data.dist_from_average / max_dist,
                'true_dist': artwork_data.dist_from_average
            });
        };
    };

    var node_data = JSON.parse(JSON.stringify(graph_globals.node_data.slice(0, graph_globals.nodes + 1)));
    var link_data = JSON.parse(JSON.stringify(graph_globals.link_data.slice(0, graph_globals.nodes)));

    var svg = d3.select(GRAPH).select('svg');

    var nodes = svg.select('#nodes').selectAll('circle').data(node_data);
    nodes.exit().remove();
    var ne = nodes.enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', (d) => { return d.id == 'avg' ? 10 : 20; })
        .merge(nodes)
        .attr('fill', (d) => { return d.color; })
        .attr('stroke', (d) => { return d3.color(d.color).darker(1); })
        .attr('stroke-width', 1)
        .on('mouseover', function (d) { d3.select(this).attr('stroke-width', 2); display_tooltip(d); })
        .on('mouseout', function () { d3.select(this).attr('stroke-width', 1); hide_tooltip(); });


    var links = svg.select('#links').selectAll('line').data(link_data);
    links.exit().remove();
    var le = links.enter()
        .append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .merge(links);

    var link_text = svg.select('#link_text').selectAll('text').data(link_data);
    link_text.exit().remove();
    var lte = link_text.enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .style('text-shadow', '-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white')
        .text((d) => { return d.true_dist; })
        .merge(link_text);

    var sim = d3.forceSimulation(node_data)
        .force('charge', d3.forceManyBody().strength(function (d, i) { return i == 0 ? -graph_width : 0; }))
        .force('center', d3.forceCenter(graph_width / 2, graph_height / 2))
        .on('tick', () => {
            lte.attr('x', (d) => { return ((d.source.x + d.target.x) / 2); })
                .attr('y', (d) => { return ((d.source.y + d.target.y) / 2); })
                .text((d) => { return d.true_dist; })

            le.attr('x1', (d) => { return d.source.x; })
                .attr('y1', (d) => { return d.source.y; })
                .attr('x2', (d) => { return d.target.x; })
                .attr('y2', (d) => { return d.target.y; });

            ne.attr('cx', (d) => { return d.x; })
                .attr('cy', (d) => { return d.y; });
        });
    sim.nodes(node_data)
        .force('link', d3.forceLink()
            .id((d) => { return d.id; })
            .distance(function (d) { return d.distance * graph_width / 2.5; })
            .links(link_data));
};

function init_tooltip() {
    var w = 360;
    var h = 480;
    var tooltip = d3.select(TOOLTIP);
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

function display_tooltip(data) {
    if (data.id != 'avg') {
        var w = 360;
        var h = 480;
        var tooltip = d3.select(TOOLTIP);
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

function hide_tooltip() {
    d3.select(TOOLTIP)
        .style('display', 'none')
        .selectAll('tr').remove();
};
