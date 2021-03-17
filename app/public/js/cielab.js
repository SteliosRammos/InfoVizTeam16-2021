function cielab_view(data_json) {
    var w = 720;
    var h = 540;

    var yCoord = 0, // L*
        yRange = [0, 100],
        yStep = 10,
        xCoord = 1, // a*
        xRange = [-90, 90],
        xStep = 15,
        zCoord = 2, // b*
        zRange = [-90, 90],
        zStep = 15;

    var origin = [w / 2, h / 4 * 3],
        scale = 40,
        pointData = [],
        xAxis = [],
        yAxis = [],
        zAxis = [],
        alpha = 0,
        beta = 0,
        startAngle = Math.PI / 4;

    var svg = d3.select(CIELAB).append('svg')
        .attr('width', w)
        .attr('height', h)
        .call(d3.drag()
            .on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd));

    var g = svg.append('g');

    var mx, my, mouseX, mouseY;

    var point3d = d3._3d()
        .x((d) => { return d.coords[xCoord] / xStep; })
        .y((d) => { return -d.coords[yCoord] / yStep; })
        .z((d) => { return d.coords[zCoord] / zStep; })
        .origin(origin)
        .rotateY(startAngle)
        .rotateX(-startAngle)
        .scale(scale);

    var axis3d = d3._3d()
        .shape('LINE_STRIP')
        .origin(origin)
        .rotateY(startAngle)
        .rotateX(-startAngle)
        .scale(scale);

    function updatePoints(data) {
        var points = g.selectAll('circle').data(data);

        points.enter()
            .append('circle')
            .attr('class', '_3d')
            .attr('stroke-width', 0.1)
            .attr('cx', (d) => { return d.projected.x; })
            .attr('cy', (d) => { return d.projected.y; })
            .merge(points)
            .sort(point3d.sort) // Intensive calculation, but improves scatterplot
            .attr('r', (d) => { return d.on ? 4 : 2; })
            .attr('stroke', (d) => { return d.on ? 'black' : 'none'; })
            .attr('fill', (d) => { return d.on ? d.chex : 'black'; })
            .attr('opacity', (d) => { return d.on ? 0.8 : 0.2; })
            .attr('cx', (d) => { return d.projected.x; })
            .attr('cy', (d) => { return d.projected.y; });
    };

    function initAxes(axes) {
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

    function updateAxes(axes) {
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

    // Something like this whenever selection is updated
    function on_update() {
        data = data_json
        pointData = d3.values(data.cielab);
        updatePoints(point3d(pointData));
    };

    function init() {
        xAxis = [], yAxis = [], zAxis = [];
        d3.range(xRange[0] / xStep, xRange[1] / xStep + 1).forEach((x) => {
            xAxis.push([x, yRange[0] / yStep, zRange[0] / zStep]);
        });
        d3.range(yRange[0] / yStep, yRange[1] / yStep + 1).forEach((y) => {
            yAxis.push([xRange[0] / xStep, -y, zRange[0] / zStep]);
        });
        d3.range(zRange[0] / zStep, zRange[1] / zStep + 1).forEach((z) => {
            zAxis.push([xRange[0] / xStep, yRange[0] / yStep, z]);
        });

        var axes = {
            'xAxis': axis3d([xAxis]),
            'yAxis': axis3d([yAxis]),
            'zAxis': axis3d([zAxis])
        };

        initAxes(axes);

        data = data_json
        pointData = d3.values(data.cielab);
        updatePoints(point3d(pointData));
    };

    function dragStart() {
        mx = d3.event.x;
        my = d3.event.y;
    };

    function dragged() {
        mouseX = mouseX || 0;
        mouseY = mouseY || 0;
        beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
        alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);

        updatePoints(point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(pointData));

        var axes = {
            'xAxis': axis3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([xAxis]),
            'yAxis': axis3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yAxis]),
            'zAxis': axis3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([zAxis])
        };
        updateAxes(axes);
    };

    function dragEnd() {
        mouseX = d3.event.x - mx + mouseX;
        mouseY = d3.event.y - my + mouseY;
    };

    init();
};