import fs from 'fs';
import fetch from 'node-fetch';

async function updateWeather() {
  const latitude = 32.55;  // Replace with your latitude
  const longitude = -83.71; // Replace with your longitude
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  const response = await fetch(url);
  const data = await response.json();
  const weatherData = {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed
  };
  fs.writeFileSync('weather.json', JSON.stringify(weatherData, null, 2));
}

// Run the function and handle any errors
updateWeather().catch(console.error);
