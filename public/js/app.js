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
let currentLocation = 'osaka-taisho';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadWeatherData();
});
async function loadWeatherData() {
    showLoading();
    hideError();

    try {
        const response = await fetch('data/weather.json');
        if (!response.ok) {
            throw new Error('天気データの読み込みに失敗しました');
        }
        
        weatherCache = await response.json();
        console.log('✅ Weather data loaded:', Object.keys(weatherCache));
        
        // ビルド情報を読み込み
        let buildTime = null;
        try {
            const buildResponse = await fetch('data/build-info.json');
            if (buildResponse.ok) {
                const buildInfo = await buildResponse.json();
                buildTime = buildInfo.buildTime;
            }
        } catch (error) {
            console.log('ビルド情報が見つかりません');
        }
        
        // デフォルトで大阪を表示
        displayWeatherForLocation('osaka-taisho', buildTime);
    } catch (error) {
        console.error('Error loading weather data:', error);
        showError('天気データの読み込みに失敗しました。しばらく待ってから再度お試しください。');
    }
}

function displayWeatherForLocation(locationKey, buildTime) {
    if (!weatherCache) {
        showError('天気データがまだ読み込まれていません');
        return;
    }

    const locationData = weatherCache[locationKey];

    if (!locationData) {
        showError(`データが見つかりません: ${locationKey}`);
        return;
    }

    hideError();
    displayCurrentWeather(locationData);
    displayHourlyForecast(locationData);
    displayDailyForecast(locationData);
    displayUpdateInfo(locationData.lastUpdate, buildTime);
    showWeatherContent();
}

// 更新情報を表示（天気データとサイト更新の両方）
function displayUpdateInfo(dataTime, buildTime) {
    const dataDate = new Date(dataTime);
    const now = new Date();
    
    // 天気データの時刻
    const dataTimeStr = dataDate.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    });
    
    let displayText = `天気データ: ${dataTimeStr}`;
    
    // サイト更新時刻（あれば）
    if (buildTime) {
        const buildDate = new Date(buildTime);
        const diffMinutes = Math.floor((now - buildDate) / 1000 / 60);
        
        let buildText;
        if (diffMinutes < 1) {
            buildText = 'たった今';
        } else if (diffMinutes < 60) {
            buildText = `${diffMinutes}分前`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            buildText = `約${hours}時間前`;
        }
        
        displayText += ` | サイト更新: ${buildText}`;
        
        // フッターには詳細時刻
        const buildTimeStr = buildDate.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tokyo'
        });
        document.getElementById('footerUpdate').textContent = `データ: ${dataTimeStr} | サイト: ${buildTimeStr}`;
    } else {
        document.getElementById('footerUpdate').textContent = dataTimeStr;
    }
    
    document.getElementById('lastUpdate').textContent = displayText;
}

// ビルド時刻を表示
function displayBuildTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 1000 / 60);
    
    let displayText;
    if (diffMinutes < 1) {
        displayText = '最終更新: たった今';
    } else if (diffMinutes < 60) {
        displayText = `最終更新: ${diffMinutes}分前`;
    } else if (diffMinutes < 1440) { // 24時間未満
        const hours = Math.floor(diffMinutes / 60);
        displayText = `最終更新: 約${hours}時間前`;
    } else {
        const days = Math.floor(diffMinutes / 1440);
        displayText = `最終更新: ${days}日前`;
    }
    
    document.getElementById('lastUpdate').textContent = displayText;
    
    const timeStr = date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    });
    document.getElementById('footerUpdate').textContent = `デプロイ: ${timeStr}`;
}

async function switchLocation(locationKey) {
    currentLocation = locationKey;
    
    // タブの切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // ビルド時刻を取得
    let buildTime = null;
    try {
        const buildResponse = await fetch('data/build-info.json');
        if (buildResponse.ok) {
            const buildInfo = await buildResponse.json();
            buildTime = buildInfo.buildTime;
        }
    } catch (error) {
        console.log('ビルド情報が見つかりません');
    }
    
    displayWeatherForLocation(locationKey, buildTime);
}

function displayWeatherForLocation(locationKey, buildTime) {
    if (!weatherCache) {
        showError('天気データがまだ読み込まれていません');
        return;
    }

    const locationData = weatherCache[locationKey];

    if (!locationData) {
        showError(`データが見つかりません: ${locationKey}`);
        return;
    }

    hideError();
    displayCurrentWeather(locationData);
    displayHourlyForecast(locationData);
    displayDailyForecast(locationData);
    displayUpdateInfo(locationData.lastUpdate, buildTime); 
    showWeatherContent();
}

// 更新情報を表示（天気データとサイト更新の両方）
function displayUpdateInfo(dataTime, buildTime) {
    const dataDate = new Date(dataTime);
    const now = new Date();
    
    // 天気データの時刻
    const dataTimeStr = dataDate.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
    });
    
    let displayText = `天気データ: ${dataTimeStr}`;
    
    // サイト更新時刻（あれば）
    if (buildTime) {
        const buildDate = new Date(buildTime);
        const diffMinutes = Math.floor((now - buildDate) / 1000 / 60);
        
        let buildText;
        if (diffMinutes < 1) {
            buildText = 'たった今';
        } else if (diffMinutes < 60) {
            buildText = `${diffMinutes}分前`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            buildText = `約${hours}時間前`;
        }
        
        displayText += ` | サイト更新: ${buildText}`;
        
        // フッターには詳細時刻
        const buildTimeStr = buildDate.toLocaleString('ja-JP', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tokyo'
        });
        document.getElementById('footerUpdate').textContent = `データ: ${dataTimeStr} | サイト: ${buildTimeStr}`;
    } else {
        document.getElementById('footerUpdate').textContent = dataTimeStr;
    }
    
    document.getElementById('lastUpdate').textContent = displayText;
}

function displayCurrentWeather(data) {
    const current = data.current;
    
    // 地名
    document.getElementById('locationName').textContent = data.name;
    
    // 現在の天気
    document.getElementById('temperature').textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById('description').textContent = current.weather[0].description;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} m/s`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.main.feels_like)}°C`;

     // 現在の湿度を表示（気温の下）
    document.getElementById('currentHumidity').textContent = `${current.main.humidity}%`;
    
    const iconCode = current.weather[0].icon;
    document.getElementById('currentIcon').textContent = weatherIcons[iconCode] || '🌤️';
    
    // 最高・最低気温（今日の予報から取得）
    const today = getTodayMinMax(data.forecast);
    document.getElementById('maxTemp').textContent = `${Math.round(today.max)}°C`;
    document.getElementById('minTemp').textContent = `${Math.round(today.min)}°C`;
    
    // 傘の必要性
    const umbrellaInfo = checkUmbrellaNeeded(data.forecast);
    updateUmbrellaInfo(umbrellaInfo);
    
    // おすすめの服装
    const clothing = recommendClothing(current.main.temp);
    document.getElementById('clothingInfo').textContent = clothing;

    // 気圧・偏頭痛注意
    const pressureInfo = checkPressureHeadache(current.main.pressure, data.forecast);
    updatePressureInfo(pressureInfo);
    
    // 鹿児島の場合は火山灰情報を表示
    const ashCard = document.getElementById('ashCard');
    if (data.hasAsh) {
        ashCard.style.display = 'flex';
        const ashInfo = checkAshRisk(current.wind);
        updateAshInfo(ashInfo);
    } else {
        ashCard.style.display = 'none';
    }
    
    // 背景色を天気によって変更
    updateBackgroundByWeather(current.weather[0].main);
}

// 今日の最高・最低気温を取得
function getTodayMinMax(forecast) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayData = forecast.list.filter(item => 
        item.dt_txt.startsWith(todayStr)
    );
    
    if (todayData.length === 0) {
        return { max: 0, min: 0 };
    }
    
    const temps = todayData.map(item => item.main.temp);
    return {
        max: Math.max(...temps),
        min: Math.min(...temps)
    };
}

// 傘の必要性をチェック（今後12時間）
function checkUmbrellaNeeded(forecast) {
    const next12Hours = forecast.list.slice(0, 4); // 3時間×4 = 12時間
    
    const rainTimes = [];
    let maxPop = 0; // 降水確率
    
    next12Hours.forEach(item => {
        const weatherMain = item.weather[0].main;
        const pop = (item.pop || 0) * 100; // 降水確率
        
        if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') {
            const time = new Date(item.dt * 1000);
            rainTimes.push(`${time.getHours()}時頃`);
        }
        
        if (pop > maxPop) maxPop = pop;
    });
    
    if (rainTimes.length > 0) {
        return {
            needed: true,
            message: `必要（${rainTimes.join(', ')}に雨）`,
            times: rainTimes
        };
    } else if (maxPop > 50) {
        return {
            needed: true,
            message: `念のため持参（降水確率${Math.round(maxPop)}%）`
        };
    } else if (maxPop > 30) {
        return {
            needed: false,
            message: `不要だが念のため（降水確率${Math.round(maxPop)}%）`
        };
    } else {
        return {
            needed: false,
            message: '不要'
        };
    }
}

function updateUmbrellaInfo(info) {
    const umbrellaCard = document.getElementById('umbrellaCard');
    const umbrellaInfoEl = document.getElementById('umbrellaInfo');
    
    umbrellaInfoEl.textContent = info.message;
    
    if (info.needed) {
        umbrellaCard.classList.add('warning');
    } else {
        umbrellaCard.classList.remove('warning');
    }
}

// 気温に応じた服装を推奨
function recommendClothing(temp) {
    if (temp >= 28) {
        return '半袖・薄着';
    } else if (temp >= 23) {
        return '長袖シャツ';
    } else if (temp >= 20) {
        return '長袖＋薄手の上着';
    } else if (temp >= 15) {
        return 'セーター・カーディガン';
    } else if (temp >= 10) {
        return 'ジャケット・コート';
    } else if (temp >= 5) {
        return '厚手のコート';
    } else {
        return 'ダウン・防寒着';
    }
}

// 桜島の火山灰リスクをチェック
function checkAshRisk(wind) {
    const windDeg = wind.deg; // 風向き（度）
    const windSpeed = wind.speed; // 風速（m/s）
    
    // 桜島は鹿児島市の東側（約90度方向）にある
    // 風向きは「風が吹いてくる方向」なので、
    // 東風（45°-135°）の場合、桜島から鹿児島市に風が吹く
    
    let riskLevel = '低';
    let message = '灰の心配なし';
    let isRisky = false;
    
    if (windDeg >= 45 && windDeg <= 135) {
        // 東風：桜島から鹿児島市方向
        if (windSpeed >= 5) {
            riskLevel = '高';
            message = `⚠️ 灰に注意（東風 ${windSpeed}m/s）`;
            isRisky = true;
        } else if (windSpeed >= 3) {
            riskLevel = '中';
            message = `△ やや注意（東風 ${windSpeed}m/s）`;
            isRisky = true;
        } else {
            riskLevel = '低';
            message = `風弱く影響少（東風 ${windSpeed}m/s）`;
        }
    } else if (windDeg >= 135 && windDeg <= 225) {
        // 南風：影響は少ないが念のため
        riskLevel = '低';
        message = `ほぼ心配なし（南風 ${windSpeed}m/s）`;
    } else {
        // 西風・北風：桜島と逆方向
        riskLevel = '低';
        message = `心配なし（風向き良好）`;
    }
    
    return { riskLevel, message, isRisky };
}

function updateAshInfo(info) {
    const ashCard = document.getElementById('ashCard');
    const ashInfoEl = document.getElementById('ashInfo');
    
    ashInfoEl.textContent = info.message;
    
    if (info.isRisky) {
        ashCard.classList.add('warning');
    } else {
        ashCard.classList.remove('warning');
    }
}

// 時間帯別の天気（今日の3時間ごと）
function displayHourlyForecast(data) {
    const container = document.getElementById('hourlyContainer');
    container.innerHTML = '';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayData = data.forecast.list.filter(item => 
        item.dt_txt.startsWith(todayStr)
    ).slice(0, 8);
    
    todayData.forEach(hour => {
        const time = new Date(hour.dt * 1000);
        const timeStr = `${time.getHours()}:00`;
        const weatherMain = hour.weather[0].main;
        const isRain = (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm');
        
        const hourItem = document.createElement('div');
        hourItem.className = `hourly-item ${isRain ? 'rain' : ''}`;
        hourItem.innerHTML = `
            <div class="hourly-time">${timeStr}</div>
            <div class="hourly-icon">${weatherIcons[hour.weather[0].icon] || '🌤️'}</div>
            <div class="hourly-temp">${Math.round(hour.main.temp)}°C</div>
            <div class="temp-range">
                <span class="temp-high">${Math.round(hour.main.temp_max)}°</span>
                <span class="temp-separator">/</span>
                <span class="temp-low">${Math.round(hour.main.temp_min)}°</span>
            </div>
            <div class="hourly-desc">${hour.weather[0].description}</div>
            ${isRain ? '<div class="rain-tag">☂️ 雨</div>' : ''}
        `;
        container.appendChild(hourItem);
    });
}

// 5日間の予報
function displayDailyForecast(data) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    const dailyData = data.forecast.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);

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
            <div class="temp-range">
                <span class="temp-high">${Math.round(day.main.temp_max)}°</span>
                <span class="temp-separator">/</span>
                <span class="temp-low">${Math.round(day.main.temp_min)}°</span>
            </div>
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

// ========================================
// 自動更新機能
// ========================================

// 最後の更新時刻を保存
let lastDataUpdate = null;

// 5分ごとにデータをチェック
setInterval(checkForUpdates, 5 * 60 * 1000); // 5分 = 300,000ms

// 更新をチェックする関数
async function checkForUpdates() {
    try {
        // キャッシュを無視して最新データを取得
        const response = await fetch(`data/weather.json?t=${Date.now()}`, {
            cache: 'no-store'
        });
        
        if (!response.ok) return;
        
        const newData = await response.json();
        const firstCity = Object.keys(newData)[0];
        const newUpdateTime = newData[firstCity]?.lastUpdate;
        
        // 初回設定
        if (!lastDataUpdate) {
            lastDataUpdate = newUpdateTime;
            return;
        }
        
        // 更新があったら自動リロード
        if (newUpdateTime && newUpdateTime !== lastDataUpdate) {
            console.log('🔄 新しい天気データを検出しました。更新します...');
            
            // 通知バナーを表示（オプション）
            showUpdateNotification();
            
            // 3秒後にリロード
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    } catch (error) {
        console.error('更新チェックエラー:', error);
    }
}

// 更新通知バナーを表示
function showUpdateNotification() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 16px 32px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        animation: slideDown 0.3s ease-out;
    `;
    banner.textContent = '🔄 新しい天気データが利用可能です。まもなく更新します...';
    
    // アニメーション
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);
}

// 初回設定
if (weatherCache) {
    const firstCity = Object.keys(weatherCache)[0];
    lastDataUpdate = weatherCache[firstCity]?.lastUpdate;
}
// 強制リロード機能
function forceReload() {
    // キャッシュをクリアしてリロード
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    location.reload(true);
}

// 気圧による偏頭痛リスクをチェック
function checkPressureHeadache(currentPressure, forecast) {
    // 気圧の変化を計算（今後6時間）
    const next6Hours = forecast.list.slice(0, 2); // 3時間×2 = 6時間
    
    let maxPressure = currentPressure;
    let minPressure = currentPressure;
    
    next6Hours.forEach(item => {
        const pressure = item.main.pressure;
        if (pressure > maxPressure) maxPressure = pressure;
        if (pressure < minPressure) minPressure = pressure;
    });
    
    const pressureChange = maxPressure - minPressure;
    
    // 気圧判定
    let riskLevel = '低';
    let message = '安定';
    let isRisky = false;
    
    // 低気圧（1013hPa未満）
    if (currentPressure < 1005) {
        riskLevel = '高';
        message = `⚠️ 低気圧注意（${currentPressure}hPa）`;
        isRisky = true;
    } else if (currentPressure < 1013) {
        riskLevel = '中';
        message = `△ やや低気圧（${currentPressure}hPa）`;
        isRisky = true;
    }
    // 気圧の急変（6時間で5hPa以上変化）
    else if (pressureChange >= 5) {
        riskLevel = '高';
        message = `⚠️ 気圧変化大（${pressureChange.toFixed(1)}hPa変化）`;
        isRisky = true;
    } else if (pressureChange >= 3) {
        riskLevel = '中';
        message = `△ 気圧変化あり（${pressureChange.toFixed(1)}hPa変化）`;
        isRisky = true;
    }
    // 安定
    else {
        riskLevel = '低';
        message = `安定（${currentPressure}hPa）`;
    }
    
    return { riskLevel, message, isRisky, pressure: currentPressure };
}

function updatePressureInfo(info) {
    const pressureCard = document.getElementById('pressureCard');
    const pressureInfoEl = document.getElementById('pressureInfo');
    
    pressureInfoEl.textContent = info.message;
    
    if (info.isRisky) {
        pressureCard.classList.add('warning');
    } else {
        pressureCard.classList.remove('warning');
    }
}