let weatherData = [];
let currentIndex = 0;
let session_path = ""
let session

const sun_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
<path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>`

const rain_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-cloud-drizzle-fill" viewBox="0 0 16 16">
<path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m6 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m-3.5 1.5a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m6 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m.747-8.498a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973"/>
</svg>`

async function fetchData() {
    session_path = localStorage.getItem("session_path")

    const sessionInfoResponse = await fetch(`http://localhost:3000/api/sessionInfo/${session_path}`);
    const sessionInfoData = await sessionInfoResponse.json();
    session = sessionInfoData

    document.getElementById("session_name").innerHTML = `${session.Meeting.Name} - ${session.Name}`

    const response = await fetch(`http://localhost:3000/api/weatherDataSeries/${session_path}`);
    const data = await response.json();
    weatherData = data.Series;

    populateTimestamps();
    updateWeatherCard(currentIndex);



    const windDirectionElement = document.getElementById('windDirection1');
    const arrowElement = document.querySelector('.arrow');


    const currentData = weatherData[currentIndex];
    windDirectionElement.innerHTML = degreeToDirection(currentData.Weather.WindDirection) + `<span>${currentData.Weather.WindSpeed} m/s</span>`;
    arrowElement.className = 'arrow ' + degreeToDirection(currentData.Weather.WindDirection).toLowerCase();
}


function populateTimestamps() {
    const timestampSelect = document.getElementById('timestampSelect');
    weatherData.forEach((data, index) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.classList.add('dropdown-item');
        let utcDateString = data.Timestamp
        let utcDate = new Date(utcDateString);
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
        let localDateString = utcDate.toLocaleDateString('en-US', options);

        link.innerHTML = localDateString
        link.addEventListener('click', function () {
            updateWeatherCard(index);
            document.getElementById('timestampDropdown').textContent = localDateString;
        });
        listItem.appendChild(link);
        timestampSelect.appendChild(listItem);
    });
}



function updateWeatherCard(index) {
    currentIndex = index;
    updateWeatherDetails();
}

function updateWeather(value) {
    if (currentIndex + value < 0) {
        currentIndex = weatherData.length - 1;
    } else if (currentIndex + value >= weatherData.length) {
        currentIndex = 0;
    } else {
        currentIndex += value;
    }

    // Ottieni la data corrente dal weatherData usando l'indice currentIndex
    const currentData = weatherData[currentIndex];
    const utcDateString = currentData.Timestamp;
    const utcDate = new Date(utcDateString);
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    const localDateString = utcDate.toLocaleDateString('en-US', options);

    document.getElementById('timestampDropdown').textContent = localDateString;
    updateWeatherDetails(currentIndex);
}


function updateWeatherDetails() {
    const timestampSelect = document.getElementById('timestampSelect');
    const timestampShow = document.getElementById('timestamp');
    const airTemperatureElement = document.getElementById('airTemperature');
    const humidityElement = document.getElementById('humidity');
    const pressureElement = document.getElementById('pressure');
    const rainfallElement = document.getElementById('rainfall');
    const trackTemperatureElement = document.getElementById('trackTemperature');
    const windDirectionElement = document.getElementById('windDirection');
    const windSpeedElement = document.getElementById('windSpeed');
    const windCompassElement = document.getElementById('windCompass');

    const currentData = weatherData[currentIndex];

    const utcDateString = currentData.Timestamp
    const utcDate = new Date(utcDateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    const localDateString = utcDate.toLocaleDateString('en-US', options);

    const timestampValue = localDateString
    const airTemperature = currentData.Weather.AirTemp;

    const humidity = currentData.Weather.Humidity;
    const progressBar = document.getElementById('humidity_progress-bar')
    const progressParent = progressBar.parentElement;
    progressParent.setAttribute('aria-valuenow', '50');
    progressBar.style.width = `${humidity}%`;
    progressBar.textContent = `${humidity} %`;

    const pressure = currentData.Weather.Pressure;
    let rainfall
    if (currentData.Weather.Rainfall == '0') {
        rainfall = sun_svg
    } else if (currentData.Weather.Rainfall == '1') {
        rainfall = rain_svg
    }
    const trackTemperature = currentData.Weather.TrackTemp;
    const windDirection = currentData.Weather.WindDirection;
    const windSpeed = currentData.Weather.WindSpeed;

    timestampSelect.value = currentIndex;
    timestampShow.textContent = timestampValue;
    airTemperatureElement.textContent = `${airTemperature} °C`;
    pressureElement.textContent = `${pressure} mbar`;
    rainfallElement.innerHTML = `${rainfall}`;
    trackTemperatureElement.textContent = `${trackTemperature} °C`;
    windDirectionElement.textContent = `${windDirection}°`;
    windSpeedElement.textContent = `${windSpeed} m/s`;

    const windDirectionElement1 = document.getElementById('windDirection1');
    const arrowElement = document.querySelector('.arrow');
    windDirectionElement1.innerHTML = degreeToDirection(windDirection) + `<span>${windSpeed} m/s</span>`;
    arrowElement.className = 'arrow ' + degreeToDirection(windDirection).toLowerCase();

}


window.onload = fetchData;


function degreeToDirection(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[val % 16];
}