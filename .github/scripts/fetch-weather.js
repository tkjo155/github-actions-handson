const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITIES = ['Tokyo', 'Osaka', 'Kyoto', 'London', 'New York', 'Paris'];

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

async function fetchWeatherForCity(city) {
    try {
        console.log(`📍 Fetching weather for ${city}...`);
        
        // 現在の天気
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;
        const current = await fetchData(currentUrl);
        
        // 5日間予報
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;
        const forecast = await fetchData(forecastUrl);
        
        console.log(`✅ Successfully fetched weather for ${city}`);
        
        return {
            city: city,
            current: current,
            forecast: forecast,
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error(`❌ Error fetching weather for ${city}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🌤️  Starting weather data fetch...');
    console.log(`📅 ${new Date().toISOString()}`);
    
    const weatherData = {};
    
    for (const city of CITIES) {
        const data = await fetchWeatherForCity(city);
        if (data) {
            weatherData[city.toLowerCase()] = data;
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
    console.log(`📊 Total cities: ${Object.keys(weatherData).length}`);
    console.log('🎉 Done!');
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});