import fs from 'fs';
import fetch from 'node-fetch';

async function updateWeather() {
  // Updated latitude and longitude
  const latitude = 32.55;
  const longitude = -83.71;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=fahrenheit&precipitation_unit=inch`;

  const response = await fetch(url);
  const data = await response.json();

  // Time conversion functions for Eastern Time (ET)
  const toET = (dateString) => new Date(dateString).toLocaleString('en-US', { timeZone: 'America/New_York' });
  const toETTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { timeZone: 'America/New_York' });

  // Current weather data
  const current = {
    temperature: data.current_weather.temperature
  };

  // Timestamps
  const forecastUpdateTime = toET(data.current_weather.time);
  const cronRunTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });

  // Hourly forecast (next 24 hours) with "2am" format
  const hourly = data.hourly.time.slice(0, 24).map((time, index) => {
    const etTime = new Date(time).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: true }).replace(':00', '').replace(' ', '').toLowerCase();
    return {
      time: etTime, // e.g., "2am"
      temperature: data.hourly.temperature_2m[index],
      precipitation: data.hourly.precipitation[index],
      probability: data.hourly.precipitation_probability[index]
    };
  });

  // Daily high and low for today
  const dailyHigh = data.daily.temperature_2m_max[0];
  const dailyLow = data.daily.temperature_2m_min[0];

  // Daily forecast (next 7 days)
  const daily = data.daily.time.map((time, index) => ({
    date: new Date(time).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' }),
    maxTemp: data.daily.temperature_2m_max[index],
    minTemp: data.daily.temperature_2m_min[index],
    precipitation: data.daily.precipitation_sum[index],
    probability: data.daily.precipitation_probability_max[index]
  }));

  // Apply class for low temperature based on thresholds
  const lowClass = dailyLow < 40 ? 'low-below-40' : dailyLow < 50 ? 'low-below-50' : '';

  // Generate static HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garden Weather</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    p { margin: 5px 0; } /* Tight spacing for paragraphs */
    .forecast-container { display: flex; overflow-x: auto; margin-bottom: 10px; } /* Reduced margin */
    .forecast-card { min-width: 100px; margin-right: 10px; padding: 10px; border: 1px solid #ccc; text-align: center; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 0.8em; } /* Reduced margin, smaller font */
    th, td { border: 1px solid black; padding: 4px; text-align: center; }
    th { background-color: #f2f2f2; }
    .below-40 { background-color: red; }
    .below-50 { background-color: yellow; }
    .low-below-40 { color: red; } /* Red text for low < 40°F */
    .low-below-50 { color: yellow; } /* Yellow text for low < 50°F */
  </style>
</head>
<body>
  <p>Curr Temp: ${current.temperature} °F</p>
  <p>High: ${dailyHigh} °F</p>
  <p class="${lowClass}">Low: ${dailyLow} °F</p>
  <p>Forecast Updated: ${forecastUpdateTime}</p>
  <p>Last Cron Run: ${cronRunTime}</p>

  <h2>Hourly Forecast (Next 8 Hours)</h2>
  <div class="forecast-container">
    ${hourly.slice(0, 8).map(hour => `
      <div class="forecast-card">
        <p>${hour.time}</p>
        <p>${hour.temperature} °F</p>
        <p>${hour.precipitation} in</p>
        <p>${hour.probability}%</p>
      </div>
    `).join('')}
  </div>

  <h2>Daily Forecast (Next 7 Days)</h2>
  <div class="forecast-container">
    ${daily.map(day => `
      <div class="forecast-card">
        <p>${day.date}</p>
        <p>Max: ${day.maxTemp} °F</p>
        <p>Min: ${day.minTemp} °F</p>
        <p>${day.precipitation} in</p>
        <p>${day.probability}%</p>
      </div>
    `).join('')}
  </div>

  <h2>Hourly Forecast (Next 24 Hours)</h2>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Temp (°F)</th>
        <th>Precip (in)</th>
        <th>Rain (%)</th>
      </tr>
    </thead>
    <tbody>
      ${hourly.map(hour => `
        <tr>
          <td>${hour.time}</td>
          <td class="${hour.temperature < 40 ? 'below-40' : hour.temperature < 50 ? 'below-50' : ''}">${hour.temperature}</td>
          <td>${hour.precipitation}</td>
          <td>${hour.probability}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  // Write the updated HTML to file
  fs.writeFileSync('index.html', html);
}

updateWeather().catch(console.error);
