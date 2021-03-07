const fs = require('fs')
let color_mapping = require('../color_mapping.json');
// cielab_data = {}

// let cielab_data = Object.entries(color_mapping).reduce((data, [key, value]) => {
//     data[key] = {
//         "on": 0,
//         "cielab_coords": value
//     }

//     return data
// }, {})

// const jsonString = JSON.stringify(cielab_data)
// fs.writeFile('../cielab_data.json', jsonString, err => {
//     if (err) {
//         console.log('Error writing file', err)
//     } else {
//         console.log('Successfully wrote file')
//     }
// })


const dsu = (arr1, arr2) => arr1
    .map((item, index) => [arr2[index], item]) // add the args to sort by
    .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
    .map(([, item]) => item); // extract the sorted items

function calc_average_clab(arr) {
    // Finds the midpoint of the array iteratively
    var average_l = arr[0][0]
    var average_a = arr[0][1]
    var average_b = arr[0][2]
    for(let counter = 1; counter < arr.length; counter++) {
        average_l = (average_l + arr[counter][0]) / 2
        average_a = (average_a + arr[counter][1]) / 2
        average_b = (average_b + arr[counter][2]) / 2
    }
    return [average_l, average_a, average_b];
}

function calc_clab_distance(c1, c2) {
    // Calculates the Delta between two Lab colors
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
}

function cielab_to_hex(lab) {
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

    return "#" + ((1 << 24) + (rgb[0]<< 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

function to_graph_data(results) {

    // let cielab_data = require('../cielab_data.json');
    var cielab_reduced = {};
    var color_freq = {};
    var artist_freq = {};
    var artworks = {};
    var distances = [];
    var ids = [];

    // 1. Get selection average color
    dominant_clabs = results.map(r => r.dominant_color_lab);
    average_clab = calc_average_clab(dominant_clabs)

    modulo = function(n, mod) {
        return n - n % mod
    }
    Object.entries(results).forEach(([key, r]) => {

        let c = r.dominant_color
        let clab = r.dominant_color_lab.replace(/\[|\]/gi, '').split(',').map(e => Math.round(parseFloat(e)))
        let cielab_key = clab.map(n => modulo.apply(null, [n, 4])).join('_')
        
        if (!cielab_reduced.hasOwnProperty(cielab_key)) {
            cielab_reduced[cielab_key] = {
                'counter': 0,
                'x': 0,
                'y': 0,
                'z': 0
            }
        }

        cielab_reduced[cielab_key].counter += 1
        cielab_reduced[cielab_key].x += clab[0]
        cielab_reduced[cielab_key].y += clab[1]
        cielab_reduced[cielab_key].z += clab[2]

        let a = r.artist_full_name
        
        color_freq.hasOwnProperty(c) ? color_freq[c] += 1 : color_freq[c] = 1;
        artist_freq.hasOwnProperty(a) ? artist_freq[a] += 1 : artist_freq[a] = 1;

        let dist_from_average = calc_clab_distance(average_clab, c)
        distances.push(dist_from_average)
        ids.push(r.id)

        artworks[r.id] = {
            'name': r.artwork_name,
            'dominant_color': r.dominant_color,
            'artist': r.artist_full_name,
            'year': r.creation_year,
            'url': r.image_url,
            'dist_from_average': dist_from_average
        }
    })

    cielab_data = Object.entries(cielab_reduced).reduce((data, [key, value]) => {
        key = [value.x / value.counter, value.y / value.counter, value.z / value.counter].map(e => Math.round(e)).join('_')
        data[key] = {
            "on": 1,
            "chex": cielab_to_hex(value.x, value.y, value.z)
        }

        return data
    }, {})
    
    let order_per_dist = dsu(ids, distances);
    
    graph_data = {
        'cielab': cielab_data,
        'frequencies': {
            'artists': artist_freq,
            'colors': color_freq
        },
        'artworks': artworks,
        'order_per_dist': order_per_dist,
        'average_color': average_clab
    }
    console.log(Object.keys(cielab_data).length)
    return graph_data
}

module.exports.graph_data = to_graph_data