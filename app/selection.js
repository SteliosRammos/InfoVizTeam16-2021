var DBConfig = require('./DBConfig');
const db = DBConfig.db;

// Fetches the artworks matching the given parameters
// Input: dictionnary with a class for each categorical variable: 
// century, nationality, artwork type, general type and school
// Output: the dominant colors, the artworks and their distance from the average 
// dominant color
function construct_sql_query(parameters) {

    var first = true;
    
    let where_clause = Object.entries(parameters).reduce((where_clause, [key, value]) => {

        if (value.length == 0) { return where_clause};

        append = (key == 'creation_year') ? key + " BETWEEN " + value['begin'] + " AND " + value['end']: key + " = '" + value + "'";

        where_clause += where_clause.length == 0 ? "WHERE " + append : " AND " + append;

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