var DBConfig = require('./DBConfig');
const db = DBConfig.db;

// Fetches the artworks matching the given parameters
// Input: dictionnary with a class for each categorical variable: 
// century, nationality, artwork type, general type and school
// Output: the dominant colors, the artworks and their distance from the average 
// dominant color
function construct_graph_data_query(parameters) {
    
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

function get_reduced_options(parameters) {
        
    let where_clause = Object.entries(parameters).reduce((where_clause, [key, value]) => {

        if (value.length == 0) { return where_clause};

        append = (key == 'creation_year') ? key + " BETWEEN " + value['begin'] + " AND " + value['end']: key + " = '" + value + "'";

        where_clause += where_clause.length == 0 ? "WHERE " + key + " != 'unknown' AND " + append : " AND " + append;

        return where_clause
    }, '')

    console.log('WHERE clause:' ,where_clause)
    var options = {
        "century": [],
        "artist_nationality": [],
        "artwork_type": [],
        "general_type": [],
        "school": []
    }

    var promises = [];

    Object.entries(options).forEach(([key, value]) => {

        var sql = `\
            SELECT DISTINCT ${key} \
            FROM artworks \
            ${where_clause}`;
        
        promises.push(
            new Promise((resolve, reject) => {
                db.query(sql, (err, results, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        var values = results.map((r) => {return r[key]})
                        resolve([key, values])
                    }
                })
            }, reason => {
                console.log(reason)
            })
        )
    })

    return promises
}

module.exports = {
    construct_graph_data_query: construct_graph_data_query,
    get_reduced_options: get_reduced_options
}