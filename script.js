const locationInput = document.getElementById('location-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const weatherInfoDiv = document.getElementById('weather-info');
const feelsLikePara = document.getElementById('feels-like');
const humidityPara = document.getElementById('humidity');
const windSpeedPara = document.getElementById('wind-speed');
const celsiusUnitSpan = document.getElementById('celsius-unit'); // Get Celsius span
const fahrenheitUnitSpan = document.getElementById('fahrenheit-unit'); // Get Fahrenheit span
const loadingIndicator = document.getElementById('loading-indicator'); // Get loading indicator
const forecastInfoDiv = document.getElementById('forecast-info'); // Get forecast info div

const API_KEY = 'a1941375c55288b59b75ddba5287c3f9'; // Replace with your actual API key
const BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const BASE_AQI_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'; // New AQI endpoint
const BASE_ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall'; // New One Call API endpoint

let currentUnits = 'metric'; // Default to metric

getWeatherBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        weatherInfoDiv.classList.remove('show');
        weatherInfoDiv.innerHTML = ''; // Clear previous weather info immediately
        forecastInfoDiv.innerHTML = ''; // Clear previous forecast info
        loadingIndicator.style.display = 'block'; // Show loading indicator
        getWeatherData(location);
    } else {
        displayError('Please enter a location.');
    }
});

// Add event listeners for unit toggle
celsiusUnitSpan.addEventListener('click', () => {
    if (currentUnits !== 'metric') {
        currentUnits = 'metric';
        celsiusUnitSpan.classList.add('active');
        fahrenheitUnitSpan.classList.remove('active');
        // Re-fetch weather data with the new unit if a location is already entered
        const location = locationInput.value.trim();
        if (location) {
            weatherInfoDiv.classList.remove('show');
            weatherInfoDiv.innerHTML = ''; // Clear previous weather info immediately
            loadingIndicator.style.display = 'block'; // Show loading indicator
            getWeatherData(location);
        }
    }
});

fahrenheitUnitSpan.addEventListener('click', () => {
    if (currentUnits !== 'imperial') {
        currentUnits = 'imperial';
        fahrenheitUnitSpan.classList.add('active');
        celsiusUnitSpan.classList.remove('active');
        // Re-fetch weather data with the new unit if a location is already entered
        const location = locationInput.value.trim();
        if (location) {
            weatherInfoDiv.classList.remove('show');
            weatherInfoDiv.innerHTML = ''; // Clear previous weather info immediately
            loadingIndicator.style.display = 'block'; // Show loading indicator
            getWeatherData(location);
        }
    }
});

async function getWeatherData(location) {
    loadingIndicator.style.display = 'block'; // Show loading indicator
    weatherInfoDiv.classList.remove('show'); // Hide previous weather info with fade out
    forecastInfoDiv.innerHTML = ''; // Clear previous forecast
    weatherInfoDiv.innerHTML = ''; // Clear previous weather info

    const weatherUrl = `${BASE_WEATHER_URL}?q=${location}&appid=${API_KEY}&units=${currentUnits}`;
    const forecastUrl = `${BASE_FORECAST_URL}?q=${location}&appid=${API_KEY}&units=${currentUnits}`;

    try {
        // Fetch current weather data
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Check for API errors (like 401 or 404)
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 401) {
                throw new Error('Invalid API Key. Please double check your key.');
            } else if (weatherResponse.status === 404) {
                throw new Error('Location not found. Please try again.');
            } else {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
        }

        // Fetch forecast data
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }

        // Fetch AQI data
        const { lat, lon } = weatherData.coord; // Get coordinates from weather data
        const aqiUrl = `${BASE_AQI_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const aqiResponse = await fetch(aqiUrl);
        const aqiData = await aqiResponse.json();

        if (!aqiResponse.ok) {
            console.error('Error fetching AQI data:', aqiData);
            // We can still display weather even if AQI fails, so we don't throw an error here
        }

        // Fetch UV Index data using One Call API
        // Exclude unnecessary parts to minimize response size
        const oneCallUrl = `${BASE_ONE_CALL_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=${currentUnits}`;
        const oneCallResponse = await fetch(oneCallUrl);
        const oneCallData = await oneCallResponse.json();

        if (!oneCallResponse.ok) {
            console.error('Error fetching One Call data:', oneCallData);
            // We can still display weather even if One Call fails, so we don't throw an error here
        }

        // Display weather and forecast data
        displayWeather(weatherData, currentUnits, aqiData, oneCallData); // Pass aqiData and oneCallData
        displayForecast(forecastData, currentUnits);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayError(error.message);
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
}

function displayWeather(data, units, aqiData, oneCallData) { // Accept aqiData and oneCallData
    // This function needs to be implemented based on the structure of the API response
    // Example (adjust based on your API's response structure):
    if (data.main && data.weather && data.wind && data.sys) {
        const weatherDescription = data.weather[0].description;
        const temperature = data.main.temp;
        const locationName = data.name;
        const weatherIconCode = data.weather[0].icon;
        const weatherIconUrl = `https://openweathermap.org/img/w/${weatherIconCode}.png`;

        const feelsLike = data.main.feels_like;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const windDirectionDegrees = data.wind.deg;
        const pressure = data.main.pressure;
        const visibility = data.visibility;
        const cloudiness = data.clouds.all;

        const sunriseTimestamp = data.sys.sunrise;
        const sunsetTimestamp = data.sys.sunset;

        // Convert timestamps to readable time
        const sunriseTime = new Date(sunriseTimestamp * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const sunsetTime = new Date(sunsetTimestamp * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        // Convert wind degrees to cardinal direction
        const windDirection = degToCardinal(windDirectionDegrees);

        // Determine unit symbols
        const tempUnitSymbol = units === 'metric' ? '°C' : '°F';
        const windUnitSymbol = units === 'metric' ? 'm/s' : 'mph';
        const visibilityUnit = units === 'metric' ? 'km' : 'miles'; // Display visibility in km for metric

        // Get AQI if available
        const aqi = (aqiData && aqiData.list && aqiData.list.length > 0) ? aqiData.list[0].main.aqi : null;

        // Get UV Index if available
        const uvi = (oneCallData && oneCallData.current && oneCallData.current.uvi !== undefined) ? oneCallData.current.uvi : null;

        // Create and append elements
        const locationElement = document.createElement('h2');
        locationElement.textContent = locationName;
        weatherInfoDiv.appendChild(locationElement);

        const iconElement = document.createElement('img');
        iconElement.src = weatherIconUrl;
        iconElement.alt = weatherDescription;
        iconElement.classList.add('weather-icon');
        weatherInfoDiv.appendChild(iconElement);

        const tempElement = document.createElement('p');
        tempElement.textContent = `Temperature: ${temperature}${tempUnitSymbol}`;
        weatherInfoDiv.appendChild(tempElement);

        const conditionElement = document.createElement('p');
        conditionElement.textContent = `Condition: ${weatherDescription}`;
        weatherInfoDiv.appendChild(conditionElement);

        const feelsLikeElement = document.createElement('p');
        feelsLikeElement.textContent = `Feels like: ${feelsLike}${tempUnitSymbol}`;
        weatherInfoDiv.appendChild(feelsLikeElement);

        const humidityElement = document.createElement('p');
        humidityElement.textContent = `Humidity: ${humidity}%`;
        weatherInfoDiv.appendChild(humidityElement);

        const windSpeedElement = document.createElement('p');
        windSpeedElement.textContent = `Wind speed: ${windSpeed} ${windUnitSymbol}`;
        weatherInfoDiv.appendChild(windSpeedElement);

        const pressureElement = document.createElement('p');
        pressureElement.textContent = `Pressure: ${pressure} hPa`;
        weatherInfoDiv.appendChild(pressureElement);

        const visibilityElement = document.createElement('p');
        // OpenWeatherMap visibility is in meters. Convert to km for metric, miles for imperial.
        const visibilityValue = units === 'metric' ? (visibility / 1000).toFixed(1) : (visibility / 1609.34).toFixed(1);
        visibilityElement.textContent = `Visibility: ${visibilityValue} ${visibilityUnit}`;
        weatherInfoDiv.appendChild(visibilityElement);

        const cloudinessElement = document.createElement('p');
        cloudinessElement.textContent = `Cloudiness: ${cloudiness}%`;
        weatherInfoDiv.appendChild(cloudinessElement);

        const sunriseElement = document.createElement('p');
        sunriseElement.textContent = `Sunrise: ${sunriseTime}`;
        weatherInfoDiv.appendChild(sunriseElement);

        const sunsetElement = document.createElement('p');
        sunsetElement.textContent = `Sunset: ${sunsetTime}`;
        weatherInfoDiv.appendChild(sunsetElement);

        const windDirectionElement = document.createElement('p');
        windDirectionElement.textContent = `Wind Direction: ${windDirection}`;
        weatherInfoDiv.appendChild(windDirectionElement);

        // Add AQI if available
        if (aqi !== null) {
            const aqiElement = document.createElement('p');
            // Map AQI index to a descriptive name (based on OpenWeatherMap scale)
            const aqiDescription = getAqiDescription(aqi);
            aqiElement.textContent = `Air Quality Index: ${aqi} (${aqiDescription})`;
            weatherInfoDiv.appendChild(aqiElement);
        }

        // Add UV Index if available
        if (uvi !== null) {
            const uviElement = document.createElement('p');
            const uviDescription = getUviDescription(uvi);
            uviElement.textContent = `UV Index: ${uvi} (${uviDescription})`;
            weatherInfoDiv.appendChild(uviElement);
        }

        // Add show class after displaying data
        setTimeout(() => {
            weatherInfoDiv.classList.add('show');
        }, 10);

    } else {
        displayError('Could not display weather data.');
    }

    // Change background based on weather condition
    const mainWeather = data.weather[0].main.toLowerCase(); // Get main weather condition
    document.body.className = ''; // Remove all existing classes from body
    document.body.classList.add(mainWeather); // Add the new weather class
}

function displayForecast(data, units) {
    // Clear previous forecast
    forecastInfoDiv.innerHTML = '';

    if (data.list) {
        // Group forecast data by day and calculate min/max temperature
        const dailyForecasts = {};

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toDateString();
            const temperature = item.main.temp;
            const weatherDescription = item.weather[0].description;
            const weatherIconCode = item.weather[0].icon;
            const chanceOfPrecipitation = item.pop; // Probability of precipitation [0, 1]

            if (!dailyForecasts[day]) {
                dailyForecasts[day] = {
                    temp_min: temperature,
                    temp_max: temperature,
                    // For simplicity, we'll store the weather info from the first entry of the day as representative
                    weatherDescription: weatherDescription,
                    weatherIconCode: weatherIconCode,
                    timestamp: item.dt * 1000,
                    chanceOfPrecipitation: chanceOfPrecipitation // Store chance of precipitation
                };
            } else {
                dailyForecasts[day].temp_min = Math.min(dailyForecasts[day].temp_min, temperature);
                dailyForecasts[day].temp_max = Math.max(dailyForecasts[day].temp_max, temperature);
                // Keep the first weather description and icon for the day
                // For chance of precipitation, let's take the maximum chance for the day
                dailyForecasts[day].chanceOfPrecipitation = Math.max(dailyForecasts[day].chanceOfPrecipitation, chanceOfPrecipitation);
            }
        });

        // Display the forecast for the next few days (excluding the current day's entry if it's in the past)
        const now = new Date().getTime();

        Object.keys(dailyForecasts).forEach(day => {
            const forecastItem = dailyForecasts[day];
            const forecastDate = new Date(forecastItem.timestamp);

            // Only display forecast for today if the timestamp is in the future, or for all future days
            if (forecastItem.timestamp * 1000 >= now - (12 * 60 * 60 * 1000)) { // A rough check to include today if it's not completely in the past (e.g., within the last 12 hours)
                const dayOfWeek = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
                const temperatureMin = forecastItem.temp_min;
                const temperatureMax = forecastItem.temp_max;
                const weatherDescription = forecastItem.weatherDescription;
                const weatherIconCode = forecastItem.weatherIconCode;
                const weatherIconUrl = `https://openweathermap.org/img/w/${weatherIconCode}.png`;
                const chanceOfPrecipitationPercent = (forecastItem.chanceOfPrecipitation * 100).toFixed(0); // Convert to percentage

                const tempUnitSymbol = units === 'metric' ? '°C' : '°F';

                const forecastItemDiv = document.createElement('div');
                forecastItemDiv.classList.add('forecast-item');

                forecastItemDiv.innerHTML = `
                    <h3>${dayOfWeek}</h3>
                    <img src="${weatherIconUrl}" alt="${weatherDescription}" class="weather-icon">
                    <p>Min: ${temperatureMin}${tempUnitSymbol}</p>
                    <p>Max: ${temperatureMax}${tempUnitSymbol}</p>
                    <p>Chance of Rain: ${chanceOfPrecipitationPercent}%</p>
                `;

                forecastInfoDiv.appendChild(forecastItemDiv);
            }
        });

    } else {
        console.error('No forecast data available.');
    }
}

function displayError(message) {
    weatherInfoDiv.innerHTML = `<p style="color: red;">${message}</p>`;
    weatherInfoDiv.classList.add('show');
}

// Helper function to convert wind degrees to cardinal direction
function degToCardinal(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}

// Helper function to get AQI description
function getAqiDescription(aqi) {
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    if (aqi === 5) return 'Very Poor';
    return 'N/A';
}

// Helper function to get UV Index description
function getUviDescription(uvi) {
    if (uvi < 3) return 'Low';
    if (uvi < 6) return 'Moderate';
    if (uvi < 8) return 'High';
    if (uvi < 11) return 'Very High';
    if (uvi >= 11) return 'Extreme';
    return 'N/A';
} 