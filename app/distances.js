const DBConfig = require('./DBConfig');
const db = DBConfig.db;

// Placeholder for real values
const cat_averages = {
    "artist": {
        "artist_a": "#54b52f",
        "artist_b": "#b041ba",
    },
    "nationality": {
        "nat_a": "#c49f6f",
        "nat_b": "#aace11",
    },
    "artwork_type": {},
    "century": {},
    "general_type": {},
    "school": {}
};

function get_distance(c1, c2) {
    // Implement distance measure here
    return 1;
}

// Gets artwork ID as input
let distance_from_average = (id, category) => {
    const artwork = db.getData('/'+id);
    const artwork_cat = artwork[category];

    const artwork_dominant_c = artwork.dominant_color;
    const cat_average_c = cat_averages[category][artwork_cat];

    return get_distance(cat_average_c, artwork_dominant_c);
}

let distance_between_artworks = (id1, id2) => {
    const artwork_1 = db.getData('/'+id1);
    const artwork_2 = db.getData('/'+id2);

    return get_distance(artwork_1.dominant_color, artwork_2.dominant_color);
}

// let distance_between_dominant_and_palette = () => {};

module.exports = {
    distance_from_average: distance_from_average,
    distance_between_artworks: distance_between_artworks,
    // distance_between_dominant_and_palette: distance_between_dominant_and_palette
}