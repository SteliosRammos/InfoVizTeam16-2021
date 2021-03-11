var DBConfig = require('./DBConfig');
const db = DBConfig.db;

// Fetches the artworks matching the given parameters
// Input: dictionnary with a class for each categorical variable: 
// century, nationality, artowrk type, general type and school
// Output: the dominant colors, the artworks and their distance from the average 
// dominant color
function construct_sql_query(parameters) {

    var first = true;
    
    let where_clause = Object.entries(parameters).reduce((where_clause, [key, value]) => {

        value = (key == 'century') ? value : "'" + value + "'"
        
        if (first) {
            where_clause += "WHERE " + key + " = " + value;
            first = false;
        } else {
            where_clause += " AND " + key + " = " + value
        }

        return where_clause
    }, '')

    var sql = `\
        SELECT id, dominant_color, dominant_color_lab, artist_full_name, artwork_name, image_url, creation_year \
        FROM artworks \
        ${where_clause}
    `;
    return sql
}

module.exports.construct_sql_query = construct_sql_query;