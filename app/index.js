const express = require('express');
const app = express();
const port = 3000;

const handlebars = require('express-handlebars');
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/d3'));
app.use(express.static(__dirname + '/json'));

app.get('/', (req, res) => {
    res.render('main', { layout: 'index', title: 'InfoVis | Team 16 | 2021' });
});

app.listen(port, () => console.log(`App available on http://localhost:${port}`));
