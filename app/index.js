const distances = require('./distances');

const express = require('express');
const app = express();
const port = 3000;

const DBConfig = require('./DBConfig');
const db = DBConfig.db;

const handlebars = require('express-handlebars');
const { runInNewContext } = require('vm');
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

// Expects an array of IDs (of length 1 or 2), and a category (optional)
app.get('/distance', (req, res) => {
    if (req.query.hasOwnProperty('category')) {
        res.send([distances.distance_from_average(req.query.id, req.query.category)])
    } else {
        res.send([distances.distance_between_artworks(req.query.id[0], req.query.id[1])])
    }
});
app.listen(port, () => console.log(`App available on http://localhost:${port}`));
