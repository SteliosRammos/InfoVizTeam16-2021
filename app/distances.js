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