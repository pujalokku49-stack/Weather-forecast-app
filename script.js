// TODO: replace with your own OpenWeather API key
const API_KEY = "7b053a5cc16befbd0807e28c7c1d53ce";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");

const currentWeatherCard = document.getElementById("currentWeather");
const cityNameEl = document.getElementById("cityName");
const weatherDescEl = document.getElementById("weatherDesc");
const tempEl = document.getElementById("temp");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("weatherIcon");

const forecastContainer = document.getElementById("forecast");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  getWeather(city);
});

cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

function showError(message) {
  errorMsg.textContent = message;
  currentWeatherCard.classList.add("d-none");
  forecastContainer.innerHTML = "";
}

async function getWeather(city) {
  errorMsg.textContent = "";

  const currentUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`; // 5-day / 3‑hour forecast[web:7][web:15]

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      showError("City not found. Please try again.");
      return;
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    renderCurrent(currentData);
    renderForecast(forecastData);
  } catch (err) {
    showError("Unable to load weather. Check your connection.");
  }
}

function renderCurrent(data) {
  const cityName = `${data.name}, ${data.sys.country}`;
  const description = data.weather[0].description;
  const temp = Math.round(data.main.temp);
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const iconCode = data.weather[0].icon; // OpenWeather icon code[web:6]

  cityNameEl.textContent = cityName;
  weatherDescEl.textContent = description;
  tempEl.textContent = `${temp} °C`;
  humidityEl.textContent = `Humidity: ${humidity}%`;
  windEl.textContent = `Wind: ${wind} m/s`;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // icon URL pattern[web:6]
  iconEl.alt = description;

  currentWeatherCard.classList.remove("d-none");
}

function renderForecast(data) {
  forecastContainer.innerHTML = "";

  const usedDates = new Set();

  for (const item of data.list) {
    // pick one reading per day around 12:00
    if (!item.dt_txt.includes("12:00:00")) continue; // 3‑hour step timestamps[web:7]

    const date = new Date(item.dt_txt);
    const dateKey = date.toDateString();

    if (usedDates.has(dateKey)) continue;
    usedDates.add(dateKey);

    const temp = Math.round(item.main.temp);
    const desc = item.weather[0].description;
    const icon = item.weather[0].icon;

    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-md-4 col-lg-2";

    card.innerHTML = `
      <div class="card text-center p-2 h-100">
        <h6 class="mb-1">${date.toLocaleDateString()}</h6>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        <p class="mb-1 fw-bold">${temp} °C</p>
        <p class="mb-0 text-capitalize">${desc}</p>
      </div>
    `;

    forecastContainer.appendChild(card);
  }
}
