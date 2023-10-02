var express = require('express');
const locations = require('../data/locations');
var router = express.Router();

/* GET restaurants listing based on location. */
router.get('/', function (req, res, next) {
    res.json(locations).status(200);
});

module.exports = router;
