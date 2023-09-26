const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const { locations, restaurants } = require('./data');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/getLocations', (req, res) => {
    res.json(locations).status(200);
})

app.get('/getRestaurants/:location', (req, res) => {
    const location = req.params.location;
    const filteresRestaurants = restaurants.filter(res => res.address.city === location);
    res.json(filteresRestaurants).status(200);
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));