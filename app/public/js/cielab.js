var cielab_width = 720;
var cielab_height = 540;
var cielab_globals = {
    'pointData': [],
    'xAxis': { // a*
        'data': [],
        'coord': 1,
        'range': [-90, 90],
        'step': 15
    },
    'yAxis': { // L*
        'data': [],
        'coord': 0,
        'range': [0, 100],
        'step': 10
    },
    'zAxis': { // b*
        'data': [],
        'coord': 2,
        'range': [-90, 90],
        'step': 15
    },
    'origin': [cielab_width / 2, cielab_height / 4 * 3],
    'scale': 40,
    'alpha': 0,
    'beta': 0,
    'startAngle': Math.PI / 4
};

function cielab_view() {

    //init_help();
    const help_text = 'Selection’s colors: this graph shows the dominant colors of the artworks in your selection. Each dot represents a different color, which appears as some artwork\'s dominant color in your selection.';

    var help_button = d3.select(CIELAB).append('span')
        .attr('class', "material-icons-outlined")
        .text('help_outline')
        .on('mouseover', () => { show_help(help_text); })
        .on('mouseout', () => { hide_help(); });

    var svg = d3.select(CIELAB).append('svg')
        .attr('width', cielab_width)
        .attr('height', cielab_height)
        .call(d3.drag()
            .on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd));

    var g = svg.append('g');

    var mx, my, mouseX, mouseY;

    var axis3d = d3._3d()
        .shape('LINE_STRIP')
        .origin(cielab_globals.origin)
        .rotateY(cielab_globals.startAngle)
        .rotateX(-cielab_globals.startAngle)
        .scale(cielab_globals.scale);

    var xStep = cielab_globals.xAxis.step,
        yStep = cielab_globals.yAxis.step,
        zStep = cielab_globals.zAxis.step,
        xRange = cielab_globals.xAxis.range,
        yRange = cielab_globals.yAxis.range,
        zRange = cielab_globals.zAxis.range;

    d3.range(xRange[0] / xStep, xRange[1] / xStep + 1).forEach((x) => {
        cielab_globals.xAxis.data.push([x, yRange[0] / yStep, zRange[0] / zStep]);
    });
    d3.range(yRange[0] / yStep, yRange[1] / yStep + 1).forEach((y) => {
        cielab_globals.yAxis.data.push([xRange[0] / xStep, -y, zRange[0] / zStep]);
    });
    d3.range(zRange[0] / zStep, zRange[1] / zStep + 1).forEach((z) => {
        cielab_globals.zAxis.data.push([xRange[0] / xStep, yRange[0] / yStep, z]);
    });

    var axes = {
        'xAxis': axis3d([cielab_globals.xAxis.data]),
        'yAxis': axis3d([cielab_globals.yAxis.data]),
        'zAxis': axis3d([cielab_globals.zAxis.data])
    };

    init_axes(axes);

    function init_axes(axes) {
        var xAxis = g.selectAll('path.xAxis').data(axes.xAxis);
        var yAxis = g.selectAll('path.yAxis').data(axes.yAxis);
        var zAxis = g.selectAll('path.zAxis').data(axes.zAxis);

        xAxis.enter()
            .append('path')
            .attr('class', '_3d xAxis')
            .merge(xAxis)
            .attr('stroke', 'black')
            .attr('stroke-width', .5)
            .attr('d', axis3d.draw);

        yAxis.enter()
            .append('path')
            .attr('class', '_3d yAxis')
            .merge(yAxis)
            .attr('stroke', 'black')
            .attr('stroke-width', .5)
            .attr('d', axis3d.draw);

        zAxis.enter()
            .append('path')
            .attr('class', '_3d zAxis')
            .merge(zAxis)
            .attr('stroke', 'black')
            .attr('stroke-width', .5)
            .attr('d', axis3d.draw);

        var xText = g.selectAll('text.xText').data(axes.xAxis[0]);
        var yText = g.selectAll('text.yText').data(axes.yAxis[0]);
        var zText = g.selectAll('text.zText').data(axes.zAxis[0]);

        xText.enter()
            .append('text')
            .attr('class', '_3d xText')
            .merge(xText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[0] * xStep != xRange[0] ? d[0] * xStep : ''; });

        yText.enter()
            .append('text')
            .attr('class', '_3d yText')
            .merge(yText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[1] * yStep != yRange[0] ? -d[1] * yStep : ''; });

        zText.enter()
            .append('text')
            .attr('class', '_3d zText')
            .merge(zText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[2] * xStep != zRange[0] ? d[2] * zStep : ''; });
    };

    function update_axes(axes) {
        g.selectAll('path.xAxis').data(axes.xAxis).attr('d', axis3d.draw);
        g.selectAll('path.yAxis').data(axes.yAxis).attr('d', axis3d.draw);
        g.selectAll('path.zAxis').data(axes.zAxis).attr('d', axis3d.draw);

        var xText = g.selectAll('text.xText').data(axes.xAxis[0]);
        var yText = g.selectAll('text.yText').data(axes.yAxis[0]);
        var zText = g.selectAll('text.zText').data(axes.zAxis[0]);

        xText.enter()
            .append('text')
            .merge(xText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[0] * xStep != xRange[0] ? d[0] * xStep : ''; });

        yText.enter()
            .append('text')
            .merge(yText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[1] * yStep != yRange[0] ? -d[1] * yStep : ''; });

        zText.enter()
            .append('text')
            .merge(zText)
            .attr('x', (d) => { return d.projected.x; })
            .attr('y', (d) => { return d.projected.y; })
            .text((d) => { return d[2] * xStep != zRange[0] ? d[2] * zStep : ''; });
    };

    function dragStart() {
        mx = d3.event.x;
        my = d3.event.y;
    };

    function dragged() {
        mouseX = mouseX || 0;
        mouseY = mouseY || 0;
        cielab_globals.beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
        cielab_globals.alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);

        update_cielab(null, 0);

        var rotate = axis3d.rotateY(cielab_globals.beta + cielab_globals.startAngle).rotateX(cielab_globals.alpha - cielab_globals.startAngle);
        var axes = {
            'xAxis': rotate([cielab_globals.xAxis.data]),
            'yAxis': rotate([cielab_globals.yAxis.data]),
            'zAxis': rotate([cielab_globals.zAxis.data])
        };
        update_axes(axes);
    };

    function dragEnd() {
        mouseX = d3.event.x - mx + mouseX;
        mouseY = d3.event.y - my + mouseY;
    };
};

function update_cielab(data, tt = 500) {
    if (data !== null) {
        cielab_globals.pointData = d3.values(data.cielab)
    }

    var point3d = d3._3d()
        .x((d) => { return d.coords[cielab_globals.xAxis.coord] / cielab_globals.xAxis.step; })
        .y((d) => { return -d.coords[cielab_globals.yAxis.coord] / cielab_globals.yAxis.step; })
        .z((d) => { return d.coords[cielab_globals.zAxis.coord] / cielab_globals.zAxis.step; })
        .origin(cielab_globals.origin)
        .rotateY(cielab_globals.beta + cielab_globals.startAngle)
        .rotateX(cielab_globals.alpha - cielab_globals.startAngle)
        .scale(cielab_globals.scale);

    var points = d3.select(CIELAB).select('svg').select('g').selectAll('circle').data(point3d(cielab_globals.pointData));
    points.exit().transition().duration(tt).attr('opacity', 0).remove();
    points.enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('stroke-width', 0.1)
        .attr('cx', (d) => { return d.projected.x; })
        .attr('cy', (d) => { return d.projected.y; })
        .merge(points)
        .sort(point3d.sort) // Intensive calculation, but improves scatterplot
        .transition().duration(tt)
        .attr('r', (d) => { return d.on ? 4 : 2; })
        .attr('stroke', (d) => { return d.on ? 'black' : 'none'; })
        .attr('fill', (d) => { return d.on ? d.chex : 'black'; })
        .attr('opacity', (d) => { return d.on ? 0.8 : 0.2; })
        .attr('cx', (d) => { return d.projected.x; })
        .attr('cy', (d) => { return d.projected.y; });
};