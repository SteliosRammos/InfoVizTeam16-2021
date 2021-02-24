const express = require('express');
const app = express();
const port = 3000;

const handlebars = require('express-handlebars');
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;
const db = new JsonDB(new Config('../data/example.json'));

// Serve boostrap css and public files (D3 code, map data)
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('main', { layout: 'index', title: 'InfoVis | Team 16 | 2021' });
});

app.get('/data', (req, res) => {
    if (req.query.hasOwnProperty('left') && req.query.hasOwnProperty('right')) {
        res.send([
            db.getData('/data/' + req.query.left),
            db.getData('/data/' + req.query.right)
        ])
    } else {
        // Compare two random paintings
        let db_count = db.count('/data');
        res.send([
            db.getData('/data/' + Math.floor(Math.random() * db_count)),
            db.getData('/data/' + Math.floor(Math.random() * db_count))
        ]);
    };
});

app.listen(port, () => console.log(`App available on http://localhost:${port}`));
