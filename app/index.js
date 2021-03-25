const selection = require('./selection');
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

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('Received: %s', message)
        parameters = JSON.parse(message);
        sql = selection.construct_sql_query(parameters);
        console.log("SQL query: %s", sql)
        db.query(sql, function(err, results, fields) {
            if (err) throw err;
            console.log("Results: %s", JSON.stringify(results))
            graph_data = results.length == 0 ? {} : graph_data_prep.graph_data(results);
            ws.send(JSON.stringify(graph_data))
            // ws.send(JSON.stringify(results))
        })
    })
})

app.listen(port, () => console.log(`App available on http://localhost:${port}`));
