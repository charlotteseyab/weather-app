# Simple Weather App

This is a simple web application that displays the current weather and a 5-day forecast for a user-specified location.

## Features

- Displays current temperature, condition, "feels like" temperature, humidity, and wind speed.
- Shows a weather icon for the current condition.
- Includes a 5-day forecast with minimum and maximum temperatures per day.
- Allows toggling between Celsius and Fahrenheit units.
- Provides dynamic background gradients based on the current weather condition.
- Includes a loading indicator while fetching data.
- Improved error handling for common API issues.

## Setup and Running

To run this application locally, you need to follow these steps:

1.  **Get a Weather API Key:**

    - This application uses the OpenWeatherMap API. You need to sign up for a free account and get an API key from their website: [https://openweathermap.org/](https://openweathermap.org/)
    - After signing up, you can find your API key in your account dashboard.

2.  **Clone or Download the Code:**

    - Make sure you have the `index.html`, `style.css`, and `script.js` files in the same directory.

3.  **Insert your API Key:**

    - Open the `script.js` file in a text editor.
    - Find the line that defines the `API_KEY` constant:
      ```javascript
      const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
      ```
    - Replace `'YOUR_API_KEY'` with the actual API key you obtained from OpenWeatherMap.

4.  **Open the Application:**
    - Simply open the `index.html` file in your web browser.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- OpenWeatherMap API
