// const JsonDB = require('node-json-db').JsonDB;
// const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

// const db = new JsonDB(new Config('../data/example.json'));
var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "8889",
    database: "omniart"
  });

module.exports.db = db;