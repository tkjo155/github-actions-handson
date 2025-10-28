// 天気アイコンのマッピング
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

let weatherCache = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();
    
    // 検索ボタンのイベント
    document.getElementById('searchBtn').addEventListener('click', () => {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            displayWeatherForCity(city);
        }
    });

    // Enterキーでも検索
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                displayWeatherForCity(city);
            }
        }
    });
});

async function loadWeatherData() {
    showLoading();
    hideError();

    try {
        // GitHub Actionsで生成されたJSONを読み込み
        const response = await fetch('data/weather.json');
        if (!response.ok) {
            throw new Error('天気データの読み込みに失敗しました');
        }
        
        weatherCache = await response.json();
        console.log('✅ Weather data loaded:', Object.keys(weatherCache));
        
        // デフォルトでTokyoを表示
        displayWeatherForCity('Tokyo');
    } catch (error) {
        console.error('Error loading weather data:', error);
        showError('天気データの読み込みに失敗しました。しばらく待ってから再度お試しください。');
    }
}

function displayWeatherForCity(cityName) {
    if (!weatherCache) {
        showError('天気データがまだ読み込まれていません');
        return;
    }

    const cityKey = cityName.toLowerCase();
    const cityData = weatherCache[cityKey];

    if (!cityData) {
        showError(`"${cityName}" の天気データが見つかりません。利用可能な都市: ${Object.keys(weatherCache).join(', ')}`);
        return;
    }

    hideError();
    displayCurrentWeather(cityData.current);
    displayForecast(cityData.forecast);
    updateLastUpdateTime(cityData.lastUpdate);
    showWeatherContent();
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('currentIcon').textContent = weatherIcons[iconCode] || '🌤️';
    
    // 背景色を天気によって変更
    updateBackgroundByWeather(data.weather[0].main);
}

function displayForecast(data) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    // 1日1回（正午のデータ）を5日分取得
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${dateStr} (${dayOfWeek})</div>
            <div class="forecast-icon">${weatherIcons[day.weather[0].icon] || '🌤️'}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
        `;
        container.appendChild(forecastItem);
    });
}

function updateBackgroundByWeather(weather) {
    const gradients = {
        'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Clouds': 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
        'Rain': 'linear-gradient(135deg, #4B79A1 0%, #283E51 100%)',
        'Drizzle': 'linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)',
        'Thunderstorm': 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)',
        'Snow': 'linear-gradient(135deg, #E6DADA 0%, #274046 100%)',
        'Mist': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
        'Fog': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'
    };
    
    document.body.style.background = gradients[weather] || gradients['Clear'];
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('weatherContent').style.display = 'none';
}

function showWeatherContent() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherContent').style.display = 'block';
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function updateLastUpdateTime(isoString) {
    const date = new Date(isoString);
    const timeStr = date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    });
    document.getElementById('lastUpdate').textContent = `最終更新: ${timeStr}`;
    document.getElementById('footerUpdate').textContent = timeStr;
}

// クイック検索用の関数（グローバルスコープ）
function quickSearch(city) {
    document.getElementById('cityInput').value = city;
    displayWeatherForCity(city);
}