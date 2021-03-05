var DBConfig = require('./DBConfig');
const db = DBConfig.db;

// Fetches the artworks matching the given parameters
// Input: dictionnary with a class for each categorical variable: 
// century, nationality, artowrk type, general type and school
// Output: the dominant colors, the artworks and their distance from the average 
// dominant color
function construct_sql_query(parameters) {

    var sql = `\
        SELECT id, dominant_color, dominant_color_lab, artist_full_name, artwork_name, image_url, creation_year \
        FROM artworks \
        WHERE \
            ${('century' in parameters) ? "century = " + parameters["century"]: ''} \
            ${('nationality' in parameters) ? "& artist_nationality = '" + parameters["nationality"] + "'" : ''} \
            ${('artwork_type' in parameters) ? "& artwork_type = '" + parameters["artwork_type"] + "'" : ''} \
            ${('general_type' in parameters) ? "& general_type = '" + parameters["general_type"] + "'" : ''} \
            ${('school' in parameters) ? (parameters["school"] == "unknown" ? '& school is unknown' : "& school = '" + parameters["school"] + "'") : ''} \
        LIMIT 5 \
    `;

    return sql
}

module.exports.construct_sql_query = construct_sql_query;