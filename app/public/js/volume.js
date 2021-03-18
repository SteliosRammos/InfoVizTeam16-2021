var volume_width = 720;
var volume_height = 540;
var volume_globals = {
    'all_data': null,
    'show_grid': true,
    'cubeData': [],
    'origin': [volume_width / 2, volume_height / 2],
    'scale': 60,
    'alpha': 0,
    'beta': 0,
    'startAngle': Math.PI / 4,
    'gridSize': 5
};

function volume_view() {
    const help_text = 'Colors\' frequency: this graph shows the frequency of colors in your selection. Each cube represents a range of colors in the RGB space and is scaled according to the frequency of colors in that cube, relative to other cubes.';
    d3.select(VOLUME).append('span')
        .attr('class', "material-icons-outlined")
        .text('help_outline')
        .on('mouseover', () => { show_help(help_text); })
        .on('mouseout', () => { hide_help(); });

    d3.select(VOLUME).append('button').style('margin-left', '10px').text('Grid').on('click', toggle_grid);
    var g = d3.select(VOLUME).append('svg')
        .attr('width', volume_width)
        .attr('height', volume_height)
        .call(d3.drag()
            .on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd))
        .append('g');

    var mx, my, mouseX, mouseY;

    var grid3d = d3._3d()
        .shape('LINE_STRIP')
        .origin(volume_globals.origin)
        .rotateY(volume_globals.startAngle)
        .rotateX(-volume_globals.startAngle)
        .scale(volume_globals.scale);

    var gridData = [];

    var offset = Math.floor(volume_globals.gridSize / 2);
    var min = -offset - 0.5,
        max = volume_globals.gridSize - offset - 0.5;
    var dash = 0.1;
    for (let x = min; x <= max; x++) {
        for (let y = min; y <= max; y++) {
            for (let z = min; z <= max; z++) {
                if ((x == min || x == max) + (y == min || y == max) + (z == min || z == max) >= 2) {
                    gridData.push([
                        [x - (x == min ? 0 : dash), y, z],
                        [x + (x == max ? 0 : dash), y, z]
                    ]);
                    gridData.push([
                        [x, y - (y == min ? 0 : dash), z],
                        [x, y + (y == max ? 0 : dash), z]
                    ]);
                    gridData.push([
                        [x, y, z - (z == min ? 0 : dash)],
                        [x, y, z + (z == max ? 0 : dash)]
                    ]);
                }
            };
        };
    };

    init_grid(grid3d(gridData));

    function init_grid(grid) {
        var gridLine = g.selectAll('path.gridLine').data(grid);

        gridLine.enter()
            .append('path')
            .attr('class', '_3d gridLine')
            .merge(gridLine)
            .attr('stroke', 'black')
            .attr('stroke-width', .5)
            .attr('d', grid3d.draw);
    };

    function update_grid(grid) {
        g.selectAll('path.gridLine').data(grid).attr('d', grid3d.draw);
    };

    function dragStart() {
        mx = d3.event.x;
        my = d3.event.y;
    };

    function dragged() {
        mouseX = mouseX || 0;
        mouseY = mouseY || 0;
        volume_globals.beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
        volume_globals.alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
        update_volume(null, 0);
        update_grid(grid3d
            .rotateY(volume_globals.beta + volume_globals.startAngle)
            .rotateX(volume_globals.alpha - volume_globals.startAngle)(gridData));
    };

    function dragEnd() {
        mouseX = d3.event.x - mx + mouseX;
        mouseY = d3.event.y - my + mouseY;
    };
};

function update_volume(data, tt = 1000) {
    var minCubeSize = 0.1;

    if (data !== null) {
        volume_globals.all_data = data;
        volume_globals.cubeData = [];
        var max = Math.max(...d3.values(data.frequencies.colors));
        d3.entries(data.frequencies.colors).forEach((d) => {
            volume_globals.cubeData.push(make_cube((d.value * (1 - minCubeSize) / max + minCubeSize) / 2, d.key));
        });
    };

    var cubes3d = d3._3d()
        .shape('CUBE')
        .x((d) => { return d.x; })
        .y((d) => { return d.y; })
        .z((d) => { return d.z; })
        .origin(volume_globals.origin)
        .rotateY(volume_globals.beta + volume_globals.startAngle)
        .rotateX(volume_globals.alpha - volume_globals.startAngle)
        .scale(volume_globals.scale);

    var cubes = d3.select(VOLUME).select('svg').select('g').selectAll('g.cube').data(cubes3d(volume_globals.cubeData), (d) => { return d.id });
    cubes.exit().transition().duration(tt).attr('opacity', 0).remove()
    var ce = cubes.enter()
        .append('g')
        .attr('class', 'cube')
        .attr('opacity', 1)
        .attr('fill', (d) => { return d.color; })
        .attr('stroke', (d) => { return d3.color(d.color).darker(1); })
        .merge(cubes)
        .sort(cubes3d.sort)
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('stroke', d3.color(d.color).brighter(1))
                .attr('stroke-width', 2);
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('stroke', d3.color(d.color).darker(1))
                .attr('stroke-width', 1);
        })
        .on('click', function (d) {
            update_graph(graph_data_for_cube(volume_globals.all_data, d.id));
        });

    var faces = cubes.merge(ce)
        .selectAll('path.face')
        .data((d) => { return d.faces; }, (d) => { return d.face; });
    faces.exit().remove()
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

function toggle_grid() {
    if (volume_globals.show_grid) {
        volume_globals.show_grid = false;
        d3.select(VOLUME).select('svg').selectAll('path.gridLine').attr('display', 'none');
    } else {
        volume_globals.show_grid = true;
        d3.select(VOLUME).select('svg').selectAll('path.gridLine').attr('display', 'inline');
    };
};

function make_cube(size, key) {
    var offset = Math.floor(volume_globals.gridSize / 2);
    var xyz = key.split('_').map(n => parseInt(n) - offset);
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var cube = [
        { x: x - size, y: -y + size, z: z + size }, // FRONT TOP LEFT
        { x: x - size, y: -y - size, z: z + size }, // FRONT BOTTOM LEFT
        { x: x + size, y: -y - size, z: z + size }, // FRONT BOTTOM RIGHT
        { x: x + size, y: -y + size, z: z + size }, // FRONT TOP RIGHT
        { x: x - size, y: -y + size, z: z - size }, // BACK  TOP LEFT
        { x: x - size, y: -y - size, z: z - size }, // BACK  BOTTOM LEFT
        { x: x + size, y: -y - size, z: z - size }, // BACK  BOTTOM RIGHT
        { x: x + size, y: -y + size, z: z - size }, // BACK  TOP RIGHT
    ];
    function xyz_to_rgb(d) {
        return Math.round(255 / volume_globals.gridSize / 2 * (1 + 2 * (d + offset)));
    };
    cube.color = `rgb(${xyz_to_rgb(x)}, ${xyz_to_rgb(y)}, ${xyz_to_rgb(z)})`;
    cube.id = key;
    return cube;
};

function graph_data_for_cube(data, id) {
    function clab_to_hex(lab) {
        var y = (lab[0] + 16) / 116,
            x = lab[1] / 500 + y,
            z = y - lab[2] / 200,
            r, g, b;

        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.2040 + z * 1.0570;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b;

        // Round the rgb
        var rgb = [Math.floor(Math.max(0, Math.min(1, r)) * 255),
        Math.floor(Math.max(0, Math.min(1, g)) * 255),
        Math.floor((Math.max(0, Math.min(1, b)) * 255))]

        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    };
    function calc_average_clab(arr) {
        // Finds the midpoint of the array iteratively
        var average_l = arr[0][0]
        var average_a = arr[0][1]
        var average_b = arr[0][2]
        for (let counter = 1; counter < arr.length; counter++) {
            average_l = (average_l + arr[counter][0]) / 2
            average_a = (average_a + arr[counter][1]) / 2
            average_b = (average_b + arr[counter][2]) / 2
        }
        return [average_l, average_a, average_b];
    };
    function calc_clab_distance(c1, c2) {
        // Separate colors
        const l1 = c1[0]
        const a1 = c1[1]
        const b1 = c1[2]
        const l2 = c2[0]
        const a2 = c2[1]
        const b2 = c2[2]

        // Utility functions added to Math Object
        Math.rad2deg = function (rad) {
            return 360 * rad / (2 * Math.PI);
        };
        Math.deg2rad = function (deg) {
            return (2 * Math.PI * deg) / 360;
        };
        // Start Equation
        const avgL = (l1 + l2) / 2;
        const C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
        const C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
        const avgC = (C1 + C2) / 2;
        const G = (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) / 2;

        const A1p = a1 * (1 + G);
        const A2p = a2 * (1 + G);

        const C1p = Math.sqrt(Math.pow(A1p, 2) + Math.pow(b1, 2));
        const C2p = Math.sqrt(Math.pow(A2p, 2) + Math.pow(b2, 2));

        const avgCp = (C1p + C2p) / 2;

        let h1p = Math.rad2deg(Math.atan2(b1, A1p));
        if (h1p < 0) {
            h1p = h1p + 360;
        }

        let h2p = Math.rad2deg(Math.atan2(b2, A2p));
        if (h2p < 0) {
            h2p = h2p + 360;
        }

        const avghp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h1p) / 2;

        const T = 1 - 0.17 * Math.cos(Math.deg2rad(avghp - 30)) + 0.24 * Math.cos(Math.deg2rad(2 * avghp)) + 0.32 * Math.cos(Math.deg2rad(3 * avghp + 6)) - 0.2 * Math.cos(Math.deg2rad(4 * avghp - 63));

        let deltahp = h2p - h1p;
        if (Math.abs(deltahp) > 180) {
            if (h2p <= h1p) {
                deltahp += 360;
            } else {
                deltahp -= 360;
            }
        }

        const delta_lp = l2 - l1;
        const delta_cp = C2p - C1p;

        deltahp = 2 * Math.sqrt(C1p * C2p) * Math.sin(Math.deg2rad(deltahp) / 2);

        const Sl = 1 + ((0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2)));
        const Sc = 1 + 0.045 * avgCp;
        const Sh = 1 + 0.015 * avgCp * T;

        const deltaro = 30 * Math.exp(-(Math.pow((avghp - 275) / 25, 2)));
        const Rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
        const Rt = -Rc * Math.sin(2 * Math.deg2rad(deltaro));

        const kl = 1;
        const kc = 1;
        const kh = 1;

        const deltaE = Math.sqrt(Math.pow(delta_lp / (kl * Sl), 2) + Math.pow(delta_cp / (kc * Sc), 2) + Math.pow(deltahp / (kh * Sh), 2) + Rt * (delta_cp / (kc * Sc)) * (deltahp / (kh * Sh)));

        return deltaE;
    };
    function hex_to_rgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };
    function rgb_to_clab(rgb) {
        rgb = rgb.map((d) => {
            d = d / 255;
            d = d > 0.04045 ? ((d + 0.055) / 1.055) ** 2.4 : d / 12.92;
            return d * 100
        });
        var xyz = [
            (rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805) / 95.047,
            (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 100.0,
            (rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505) / 108.883
        ].map((d) => {
            return d > 0.008856 ? d ** (0.3333333333333333) : (7.787 * d) + (16 / 116);
        });
        return [(116 * xyz[1]) - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
    };
    function modulo(n, mod) {
        return n - n % mod;
    };

    var artwork_ids = [];
    var dominant_clabs = [];
    var artworks = {};
    Object.entries(data.artworks).forEach(([artwork_id, r]) => {
        let crgb = hex_to_rgb(r.dominant_color);

        let crgb_key = crgb.map(n => Math.floor(modulo.apply(null, [n, 52]) / 52)).join('_') // 52 -> 5x5x5 grid

        if (crgb_key === id) {
            artwork_ids.push(artwork_id);
            dominant_clabs.push(rgb_to_clab(crgb));
            artworks[artwork_id] = r;
        };
    });
    average_clab = calc_average_clab(dominant_clabs);
    average_crgb = clab_to_hex(average_clab);
    var distances = dominant_clabs.map((clab) => { return parseFloat(calc_clab_distance(average_clab, clab)).toFixed(2); })
    artwork_ids.map((artwork_id, i) => { artworks[artwork_id].dist_from_average = distances[i]; });

    const dsu = (arr1, arr2) => arr1
        .map((item, index) => [arr2[index], item]) // add the args to sort by
        .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
        .map(([, item]) => item); // extract the sorted items

    let order_per_dist = dsu(artwork_ids, distances);

    graph_data = {
        'artworks': artworks,
        'order_per_dist': order_per_dist,
        'average_color': average_crgb
    };
    console.log(artworks)
    return graph_data;
};