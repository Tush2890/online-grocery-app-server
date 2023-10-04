var express = require('express');
const restaurants = require('../data/restaurants');
var router = express.Router();

router.get('/:location', (req, res, next) => {
  const location = req.params.location;
  const searchString = req.query.searchString?.toLocaleLowerCase();
  let filteresRestaurants = [];
  if (!searchString || searchString.length === 0) {
    filteresRestaurants = restaurants.filter(res => res.address.city === location);
  } else {
    filteresRestaurants = restaurants.filter(res => res.address.city === location &&
      (res.name.toLocaleLowerCase().includes(searchString) || res.category.some(cat => cat.includes(searchString)))
    );
  }
  res.json(filteresRestaurants).status(200);
});

module.exports = router;
