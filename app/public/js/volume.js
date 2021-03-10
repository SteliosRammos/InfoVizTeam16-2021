function volume_view(data_json, container_selector) {
    var container = d3.select(container_selector);
    var w = 720;
    var h = 540;

    var origin = [w / 2, h / 2],
        gridSize = 5;
        scale = 60,
        cubeData = [],
        alpha = 0,
        beta = 0,
        startAngle = Math.PI / 4;

    var svg = container.append('svg')
    .attr('width', w)
    .attr('height', h)
    .call(d3.drag()
        .on('drag', dragged)
        .on('start', dragStart)
        .on('end', dragEnd));

    var g = svg.append('g');

    var mx, my, mouseX, mouseY;

    var cubes3d = d3._3d()
        .shape('CUBE')
        .x((d) => { return d.x; })
        .y((d) => { return d.y; })
        .z((d) => { return d.z; })
        .origin(origin)
        .rotateY(startAngle)
        .rotateX(-startAngle)
        .scale(scale);

    function updateCubes(data, tt) {
        var cubes = g.selectAll('g.cube').data(data, (d) => { return d.id });

        var ce = cubes.enter()
            .append('g')
            .attr('class', 'cube')
            .attr('fill', (d) => { return d.color; })
            .attr('stroke', (d) => { return d3.color(d.color).darker(1); })
            .merge(cubes)
            .sort(cubes3d.sort);

        var faces = cubes.merge(ce)
            .selectAll('path.face')
            .data((d) => { return d.faces; }, (d) => { return d.face; });

        faces.enter()
            .append('path')
            .attr('class', 'face')
            .attr('fill-opacity', 0.5)
            .classed('_3d', true)
            .merge(faces)
            .transition().duration(tt)
            .attr('d', cubes3d.draw);

        ce.selectAll('._3d').sort(d3._3d().sort);
    };

    function init() {
        d3.json(data_json).then((data) => {
            cubeData = [];
            var max = Math.max(...d3.values(data.frequencies.colors));
            d3.entries(data.frequencies.colors).forEach((d) => {
                cubeData.push(makeCube(d.value / max / 2, d.key));
            });
            updateCubes(cubes3d(cubeData), 1000);
        });
    };

    function makeCube(size, key) {
        var offset = Math.floor(gridSize / 2);
        var xyz = key.split('_').map(n => parseInt(n) - offset);
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];
        var cube = [
            {x: x - size, y: -y + size, z: z + size}, // FRONT TOP LEFT
            {x: x - size, y: -y - size, z: z + size}, // FRONT BOTTOM LEFT
            {x: x + size, y: -y - size, z: z + size}, // FRONT BOTTOM RIGHT
            {x: x + size, y: -y + size, z: z + size}, // FRONT TOP RIGHT
            {x: x - size, y: -y + size, z: z - size}, // BACK  TOP LEFT
            {x: x - size, y: -y - size, z: z - size}, // BACK  BOTTOM LEFT
            {x: x + size, y: -y - size, z: z - size}, // BACK  BOTTOM RIGHT
            {x: x + size, y: -y + size, z: z - size}, // BACK  TOP RIGHT
        ];
        function xyz_to_rgb(d) {
            return Math.round(255 / gridSize / 2 * (1 + 2 * (d + offset)));
        };
        cube.color = `rgb(${xyz_to_rgb(x)}, ${xyz_to_rgb(y)}, ${xyz_to_rgb(z)})`;
        cube.id = key;
        return cube;
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
        updateCubes(cubes3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubeData), 0);
    };

    function dragEnd() {
        mouseX = d3.event.x - mx + mouseX;
        mouseY = d3.event.y - my + mouseY;
    };

    init();
};
