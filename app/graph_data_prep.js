const fs = require('fs')
const cielab = require('./cielab_util');
let color_mapping = require('../color_mapping.json');
const cielab_util = require('./cielab_util');
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
    .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
    .map(([, item]) => item); // extract the sorted items

function to_graph_data(results) {

    // let cielab_data = require('../cielab_data.json');
    var cielab_reduced = {};
    var rgb_freq = {};
    var artist_freq = {};
    var artworks = {};
    var distances = [];
    var ids = [];

    // 1. Get selection average color
    dominant_clabs = results.map(r => r.dominant_color_lab.replace(/\[|\]/gi, '').split(',').map(e => parseFloat(e)));
    average_clab = cielab.calc_average_clab(dominant_clabs);
    average_crgb = cielab_util.clab_to_hex(average_clab);

    modulo = function(n, mod) {
        return n - n % mod
    }
    Object.entries(results).forEach(([key, r]) => {

        let clab = r.dominant_color_lab.replace(/\[|\]/gi, '').split(',').map(e => parseFloat(e))
        let cielab_key = clab.map(n => modulo.apply(null, [n, 3])).join('_')
        
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
        

        let chex = r.dominant_color
        let crgb = cielab_util.hex_to_rgb(chex)

        let crgb_key = crgb.map(n => Math.floor(modulo.apply(null, [n, 52]) / 52)).join('_') // 52 -> 5x5x5 grid
        
        rgb_freq.hasOwnProperty(crgb_key) ? rgb_freq[crgb_key] += 1 : rgb_freq[crgb_key] = 1;
        artist_freq.hasOwnProperty(a) ? artist_freq[a] += 1 : artist_freq[a] = 1;

        let dist_from_average = parseFloat(cielab.calc_clab_distance(average_clab, clab)).toFixed(2);
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
        var coords = [value.x / value.counter, value.y / value.counter, value.z / value.counter]
        key = coords.map(e => Math.round(e)).join('_')
        data[key] = {
            "coords": coords,
            "on": 1,
            "chex": cielab.clab_to_hex(coords)
        }

        return data
    }, {})
    
    let order_per_dist = dsu(ids, distances);

    graph_data = {
        'cielab': cielab_data,
        'frequencies': {
            'artists': artist_freq,
            'colors': rgb_freq
        },
        'artworks': artworks,
        'order_per_dist': order_per_dist,
        'average_color': average_crgb
    }
    // console.log(Object.keys(cielab_data).length)
    return graph_data
}

module.exports.graph_data = to_graph_data