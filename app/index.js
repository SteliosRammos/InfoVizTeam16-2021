const selection = require('./selection');
var isEqual = require('lodash.isequal');

var graph_data_prep = require('./graph_data_prep');

const express = require('express');
const handlebars = require('express-handlebars');
const { runInNewContext } = require('vm');
const ws = require('ws');
var bodyParser = require('body-parser');

const app = express();
const port = 3000;

//initialize the WebSocket server instance
const wss = new ws.Server({port: 40510})

// create application/json parser
var jsonParser = bodyParser.json()

const DBConfig = require('./DBConfig');
const db = DBConfig.db;


app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

// Serve boostrap css and public files (D3 code, map data)
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('main', { layout: 'index', title: 'InfoVis | Team 16 | 2021' });
});

// app.post('/data', jsonParser, async (req, res) => {

//     if (req.body.hasOwnProperty('parameters')) {
                 
//         sql = selection.construct_sql_query(req.body.parameters);
//         console.log(sql)
        
//         db.query(sql, function(err, results, fields) {
//             if (err) throw err;
            
//             graph_data = results.length == 0 ? {} : graph_data_prep.graph_data(results);  
            
//         })

//         res.send(
//             graph_data
//         )
//     }
// });

// Cache latest graph data
var last_data;

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        // console.log('Received: %s', message)
        data = JSON.parse(message);
        parameters = data['parameters']
        first_load = data['first_load']

        if (first_load) {
            last_data = undefined;
        }

        sql = selection.construct_graph_data_query(parameters);
        console.log("SQL query: %s", sql)
        db.query(sql, function(err, results, fields) {
            if (err) throw err;

            graph_data = results.length == 0 ? {} : graph_data_prep.graph_data(results);
            promises = selection.get_reduced_options(parameters); 

            Promise.all(promises).then((results) => {
                var options = results.reduce((options, [key, values]) => {
                    options[key] = values;
                    return options
                }, {})
                
                if (!isEqual(graph_data, last_data)) {
                    console.log('Result data changed!')
                    last_data = graph_data;
                    console.log('o:', options)
                    message = {
                        'unchanged': false,
                        'options': options,
                        'graph_data': graph_data
                    }
        
                    ws.send(JSON.stringify(message))
                } else {
                    console.log('Same old...')
                    ws.send(JSON.stringify({'unchanged': true}))
                }
            });
        })
    })
})

app.listen(port, () => console.log(`App available on http://localhost:${port}`));
