var express = require('express');
const { caching } = require('../redis/middleware');
const client = require('../redis');
var router = express.Router();
var mysql = require('mysql2');

const getCached = (req, res, next) => {
  const location = req.params.location;
  const currentPage = req.query.startPage;
  const searchString = req.query.searchString;
  const redis_key = `${location}-${currentPage}-${searchString}`;
  client.get(redis_key, function (err, reply) {
    if (err) {
      console.log(`Error retreving the key - ${err}`);
      next();
    }
    if (reply == null) {
      next();
    } else {
      res.status(200).json({
        message: `Cahce hit for ${location}, page ${currentPage} and searchString ${searchString}`,
        data: JSON.parse(reply)
      })
    }
  });
}

let dbConnection;

const createDbConnection = () => {
  dbConnection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });
}

const invokeQuery = (query) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(query, (err, result) => {
      if (err) reject(new Error(err.message));
      else resolve(result);
    });
  });
}

router.get('/:location', getCached, async (req, res, next) => {
  const location = req.params.location;
  const searchString = req.query.searchString;
  const startPage = req.query.startPage;
  createDbConnection();
  const restaurantQuery = `SELECT * FROM (SELECT ROW_NUMBER() OVER(ORDER BY Id) AS rNum, Id, Name, Rating, ProductId, Open, Category, City, State, PostCode, StreetAddress, Country, Area, ImageFile FROM Restaurant) As tbl WHERE tbl.rNum > ${startPage * 20} AND tbl.Area='${location}' AND tbl.Name LIKE '%${searchString}%' LIMIT 20`;
  const productQuery = 'SELECT Name, Price, Currency, Rating, Veg, Description, RestaurantId FROM Product WHERE RestaurantId = (SELECT result.Id FROM (SELECT COUNT(tbl.Id), tbl.Id FROM (SELECT r.Id FROM Restaurant r INNER JOIN Product p ON r.Id = p.RestaurantId) as tbl GROUP BY tbl.Id) as result)';
  const restaurantResult = await invokeQuery(restaurantQuery);
  const productResult = await invokeQuery(productQuery);
  const result = restaurantResult.map(rest => {
    const associatedProducts = productResult.filter(prod => prod.RestaurantId === rest.Id);
    rest['items'] = associatedProducts;
    return rest;
  })
  console.log(result)
  caching(`${location}-${startPage}-${searchString}`, result);
  res.status(200).json({
    message: `Cahce miss for ${location}, page ${startPage} and searchString ${searchString}`,
    data: result
  });
});

module.exports = router;
