var express = require('express');
const restaurants = require('../data/restaurants');
const { caching } = require('../redis/middleware');
const client = require('../redis');
var router = express.Router();

const getCached = (req, res, next) => {
  const location = req.params.location;
  const currentPage = req.query.startPage;
  const redis_key = `${location}-${currentPage}`;
  client.get(redis_key, function (err, reply) {
    if (err) {
      console.log(`Error retreving the key - ${err}`);
      next();
    }
    if (reply == null) {
      next();
    } else {
      res.status(200).json({
        message: `Cahce hit for ${location} and page ${currentPage}`,
        data: JSON.parse(reply)
      })
    }
  });
}

router.get('/:location', getCached, (req, res, next) => {
  const location = req.params.location;
  const searchString = req.query.searchString?.toLocaleLowerCase();
  const currentPage = req.query.startPage;
  let filteresRestaurants = [];
  if (!searchString || searchString.length === 0) {
    filteresRestaurants = restaurants.filter(res => res.address.city === location);
  } else {
    filteresRestaurants = restaurants.filter(res => res.address.city === location &&
      (res.name.toLocaleLowerCase().includes(searchString) || res.category.some(cat => cat.includes(searchString)))
    );
  }
  const result = filteresRestaurants.splice(currentPage * 20, 20);
  caching(`${location}-${currentPage}`, result);
  res.status(200).json({
    message: `Cahce miss for ${location} and page ${currentPage}`,
    data: result
  })
});

module.exports = router;
