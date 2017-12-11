var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var pg = require('pg');

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Connect to pg.
var conString = process.env.ELEPHANTSQL_URL || "postgres://andreas:5432@localhost/smart_validator_test_3";

// Parse the request
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;

// Create the routes.
var router = express.Router();
router.get('/', function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function (err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query('SELECT * FROM announcements LIMIT 42;', function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }

            res.json(
                {
                    announcements: result.rows.map(function (obj) {
                        return {
                            id: obj.id,
                            asn: obj.asn,
                            prefix: obj.prefix,
                        }
                    }),
                    total: 1
                }
            );
            client.end();
        });
    });
});
app.use('/api', router);

// Start the server
app.listen(port);
console.log('SmartValidatorUI server is running on port ' + port);
