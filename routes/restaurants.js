var express = require('express');
const restaurants = require('../data/restaurants');
var router = express.Router();

/* GET restaurants listing based on location. */
router.get('/:location', function (req, res, next) {
  const location = req.params.location;
  const filteresRestaurants = restaurants.filter(res => res.address.city === location);
  res.json(filteresRestaurants).status(200);
});

module.exports = router;
