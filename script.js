async function getTheWeather(city = null) {
    // Gets the city name from input when it is note given
    if (!city) 
        {
        city = document.getElementById('city-name').value.trim();
        if (!city) 
            {
            alert('Please can you enter a city');
            return;
        }
    }

    try 
    {
        // Fetching the geolocation
        const geoCodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&format=json`);
        const geoCodeData = await geoCodeResponse.json();
        
        if (!geoCodeData.results || geoCodeData.results.length === 0) 
            {
            alert('City could not found.');
            return;
        }

        const { latitude, longitude, name } = geoCodeData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        const weatherData = await weatherRes.json();

        // Displaying the weather info
        displayTheWeather(weatherData, name);
        storeForecastFor7Day(weatherData, name);
    } 
    catch (error) 
    {
        console.error('Unable fetching weather data:', error);
    }
}

// Shows the current weather on the index.html
function displayTheWeather(data, cityName) 
{
    document.getElementById('temperature-div').innerHTML = `<p>${data.current.temperature_2m}&deg;C</p>`;
    document.getElementById('weather-information').innerHTML = `<p>${cityName}</p>`;
  document.getElementById('favorite-btn').style.display = 'block';
    document.getElementById('favorite-btn').setAttribute('data-city', cityName);

  document.getElementById('seven-day-btn').style.display = 'block';
    document.getElementById('seven-day-btn').setAttribute('data-city', cityName);
}

//Store the forecast data also reseting previous forecast
function storeForecastFor7Day(data, cityName) 
{
    localStorage.setItem("latestForecast", JSON.stringify(data));
    localStorage.setItem("latestCity", cityName);

    localStorage.setItem("forecastUpdated", Date.now()); 
}

function goTo7Day() {
    window.location.href = `7-day.html`;
}

//Toggle city as a favorite and store in local storage
function toggleFavorite() 
{
    const cityName = document.getElementById('favorite-btn').getAttribute('data-city');
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // When the city is already in the favorites list, it does nothing
    if (!favorites.includes(cityName)) 
        {
        favorites.push(cityName);

        localStorage.setItem("favorites", JSON.stringify(favorites));
        loadFavorites(); 
}
}

// Load and display favorite cities
function loadFavorites()
 {
    const favoritesList = document.getElementById('favorites-list');
    if (!favoritesList) return;

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesList.innerHTML = favorites.map(city => `
        <li>
       ${city}
        <button onclick="removeFavorite('${city}')">Remove</button>
        </li>
    `).join('');
}
// Remove a city from favorites
function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}


document.addEventListener("DOMContentLoaded", loadFavorites);
function toggleMenu() {
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');

    // Make sure the toggle menu visibility
    menu.classList.toggle('open');
    icon.classList.toggle('open');

    if (menu.classList.contains('open')) 
        {
        document.body.style.overflow = 'hidden';
    } 
    else
     {
        document.body.style.overflow = 'auto';
    }
}

// Close menu when clicking outside
document.addEventListener('click', function (event) 
{
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');

    if (!menu.contains(event.target) && !icon.contains(event.target)) 
        {
        menu.classList.remove('open');
        icon.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
});
// Load forecast data from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
    const cityName = localStorage.getItem("latestCity");
    const forecastData = JSON.parse(localStorage.getItem("latestForecast"));
    const lastUpdate = localStorage.getItem("forecastUpdated");

    if (!cityName || !forecastData || !lastUpdate) {
        document.getElementById('forecast-container').innerHTML = "<h3> No forecast available. Search a city first.</h1>";
        return;
    }

    displayTheWeatherIn7Day(forecastData, cityName);
});


// Shows the 7-day weather on the webpage
function displayTheWeatherIn7Day(data, cityName) 
{
    const forecastDiv = document.getElementById('forecast-container');
    forecastDiv.innerHTML = `<h2>${cityName}</h2>`;
    const { temperature_2m_max, temperature_2m_min } = data.daily;
    const today = new Date();

    const forecastHTML = temperature_2m_max.map((maxTemp, index) => {
        const minTemp = temperature_2m_min[index];
        const day = new Date(today);
        day.setDate(today.getDate() + index);
        const dayName = day.toLocaleDateString(undefined, { weekday: 'long' });

        return `<div class="forecast-item">
                    <p><strong>${dayName}</strong></p>
                    <p>Max: ${maxTemp}&deg;C</p>
                    <p>Min: ${minTemp}&deg;C</p>
                </div>`;
    }).join('');

    forecastDiv.innerHTML += forecastHTML;
}