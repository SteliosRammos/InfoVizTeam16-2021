// const fs = require('fs')
// let color_mapping = require('../color_mapping.json');
// // cielab_data = {}

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
    // implement here
    return 1;
}

function calc_clab_distance(c1, c2) {
    // implement here
    return 1;
}

function to_graph_data(results) {
    
    let cielab_data = require('../cielab_data.json');
    var color_freq = {};
    var artist_freq = {};
    var artworks = {};
    var distances = [];
    var ids = [];

    // 1. Get selection average color
    dominant_clabs = results.map(r => r.dominant_color_lab);
    average_clab = calc_average_clab(dominant_clabs)

    Object.entries(results).forEach(([key, r]) => {

        let c = r.dominant_color
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

        cielab_data[c].on = 1
    })

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

    return graph_data
}

module.exports.graph_data = to_graph_data