'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

const app = express();
app.use(cors());

function convertTime(timeInMilliseconds) {
  return new Date(timeInMilliseconds).toString().split(' ').slice(0, 4).join(' ');
}

function Location(query, geoData) {
  this.search_query = query;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = convertTime(weatherData.time * 1000);
}

function Event(eventData) {
  this.link = eventData.url;
  this.name = eventData.name.text;
  this.event_date = eventData.url;
  this.summary = eventData.description.text;
}

function handleError(error, response) {
  response.status(error.status).send(error.message);
}

app.get('/location', (request, response) => {
  superagent
    .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`)
    .then((geoData) => {
      const location = new Location(request.query.data, geoData.body);
      response.send(location);
    })
    .catch((error) => handleError(error, response));
});

app.get('/events', (request, response) => {
  superagent
    .get(`https://www.eventbriteapi.com/v3/events/search/?token=${process.env.EVENTBRITE_API_KEY}&location.latitude=${request.query.data.latitude}&location.longitude=${request.query.data.longitude}&location.within=10km`)
    .then((eventData) => {
      const events = eventData.body.events.map((event) => new Event(event));
      response.send(events);
    })
    .catch((error) => handleError(error, response));
});

app.get('/weather', (request, response) => {
  superagent
    .get(`https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`)
    .then((weatherData) => {
      const weather = weatherData.body.daily.data.map((day) => new Weather(day));
      response.send(weather);
    })
    .catch((error) => handleError(error, response));
});

app.get(/.*/, (req, res) => {
  res.status(404).send({ status: 404, responseText: 'This item could not be found..' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('I know that you came to party baby, baby, baby, baby');
});
