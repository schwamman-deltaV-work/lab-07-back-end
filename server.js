'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

const app = express();
app.use(cors());

function Location(query, geoData){
  this.search_query = query;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Weather(weatherData, i) {
  this.forecast = weatherData.daily.data[i].summary;
  this.time = convertTime();
  function convertTime() {
    return new Date(weatherData.daily.data[i].time * 1000).toString().split(' ').slice(0, 4).join(' ');
  }
}

app.get('/location', (request, response) => {
  try {
    superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`)
      .then((geoData) => {
        const location = new Location(request.query.data, geoData.body);
        response.send(location);
      });
  } catch(error) {
    response.status(500).send('Dis website is broke. Call someone who cares.');
  }
});

app.get('/weather', (request, response) => {
  try {
    const weatherData = require('./data/darksky.json');
    //Interesting usage of weather constructor.
    const weather = [];
    for (let i = 0; i < weatherData.daily.data.length; i++) {
      let dailyWeather = new Weather(weatherData, i);
      weather.push(dailyWeather);
    }
    response.send(weather);
  } catch(error) {
    response.status(500).send('Dis website is broke. Call someone who cares.');
  }
});

app.get(/.*/, (req, res) => {
  res.status(404).send({status: 404, responseText: 'This item could not be found..'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('I know that you came to party baby, baby, baby, baby');
});
