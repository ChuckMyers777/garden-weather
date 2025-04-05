import fs from 'fs';
import fetch from 'node-fetch';

async function updateWeather() {
  const latitude = 52.52;  // Replace with your garden’s latitude
  const longitude = 13.41; // Replace with your garden’s longitude
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=fahrenheit&precipitation_unit=inch`;

  const response = await fetch(url);
  const data = await response.json();

  // Current weather
  const current = {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed
  };

  // Update timestamp
  const updateTime = new Date().toLocaleString();

  // Hourly forecast (next 24 hours)
  const hourly = data.hourly.time.slice(0, 24).map((time, index) => ({
    time: time,
    temperature: data.hourly.temperature_2m[index],
    precipitation: data.hourly.precipitation[index],
    probability: data.hourly.precipitation_probability[index]
  }));

  // Daily forecast (next 7 days)
  const daily = data.daily.time.map((time, index) => ({
    date: time,
    maxTemp: data.daily.temperature_2m_max[index],
    minTemp: data.daily.temperature_2m_min[index],
    precipitation: data.daily.precipitation_sum[index],
    probability: data.daily.precipitation_probability_max[index]
  }));

  // Structure the weather data
  const weatherData = {
    current,
    updateTime,
    hourly,
    daily
  };

  // Write to weather.json
  fs.writeFileSync('weather.json', JSON.stringify(weatherData, null, 2));
}

updateWeather().catch(console.error);
