const fs = require('fs');
const fetch = require('node-fetch');

async function updateWeather() {
  // Replace with your garden's latitude and longitude
  const latitude = 32.55;  // Example: Berlin
  const longitude = -83.71;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  const response = await fetch(url);
  const data = await response.json();
  const weatherData = {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed
  };
  fs.writeFileSync('weather.json', JSON.stringify(weatherData, null, 2));
}

updateWeather();
