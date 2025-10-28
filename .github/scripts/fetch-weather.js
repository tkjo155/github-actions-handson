const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENWEATHER_API_KEY;

// 特定の地点を緯度経度で指定
const LOCATIONS = [
    {
        name: '大阪市大正区',
        lat: 34.6658,
        lon: 135.4692,
        key: 'osaka-taisho'
    },
    {
        name: '神戸市三宮',
        lat: 34.6937,
        lon: 135.1955,
        key: 'kobe-sannomiya'
    },
    {
        name: '鹿児島市',
        lat: 31.5969,
        lon: 130.5571,
        key: 'kagoshima',
        hasAsh: true  // 火山灰情報を表示
    }
];

if (!API_KEY) {
    console.error('❌ API key not found!');
    process.exit(1);
}

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchWeatherForLocation(location) {
    try {
        console.log(`📍 Fetching weather for ${location.name}...`);
        
        // 現在の天気
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric&lang=ja`;
        const current = await fetchData(currentUrl);
        
        // 5日間予報（3時間ごと）
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric&lang=ja`;
        const forecast = await fetchData(forecastUrl);
        
        console.log(`✅ Successfully fetched weather for ${location.name}`);
        
        return {
            name: location.name,
            key: location.key,
            hasAsh: location.hasAsh || false,
            current: current,
            forecast: forecast,
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error(`❌ Error fetching weather for ${location.name}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🌤️  Starting weather data fetch...');
    console.log(`📅 ${new Date().toISOString()}`);
    
    const weatherData = {};
    
    for (const location of LOCATIONS) {
        const data = await fetchWeatherForLocation(location);
        if (data) {
            weatherData[location.key] = data;
        }
        // API rate limitを避けるため少し待つ
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // データを保存
    const dataDir = path.join(__dirname, '../../public/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const outputPath = path.join(dataDir, 'weather.json');
    fs.writeFileSync(outputPath, JSON.stringify(weatherData, null, 2));
    
    console.log(`✅ Weather data saved to ${outputPath}`);
    console.log(`📊 Total locations: ${Object.keys(weatherData).length}`);
    console.log('🎉 Done!');
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});