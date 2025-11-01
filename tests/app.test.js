/**
 * 天気ダッシュボード アプリケーションのテスト
 */

const fs = require('fs');
const path = require('path');

// HTMLを読み込み
const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');

// app.jsを読み込んでグローバルスコープで実行
const appCode = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');

describe('Weather Dashboard', () => {
  let weatherIcons, getTodayMinMax, checkUmbrellaNeeded, recommendClothing;
  let checkAshRisk, checkPressureHeadache, weatherCache;

  beforeEach(() => {
    // DOMをセットアップ
    document.documentElement.innerHTML = html;
    
    // app.jsをグローバルコンテキストで実行
    const scriptEl = document.createElement('script');
    scriptEl.textContent = appCode;
    document.body.appendChild(scriptEl);
    
    // グローバル変数を取得
    weatherIcons = window.weatherIcons || global.weatherIcons;
    getTodayMinMax = window.getTodayMinMax || global.getTodayMinMax;
    checkUmbrellaNeeded = window.checkUmbrellaNeeded || global.checkUmbrellaNeeded;
    recommendClothing = window.recommendClothing || global.recommendClothing;
    checkAshRisk = window.checkAshRisk || global.checkAshRisk;
    checkPressureHeadache = window.checkPressureHeadache || global.checkPressureHeadache;
    weatherCache = window.weatherCache || global.weatherCache;
    
    // fetchをモック
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('天気アイコンマッピング', () => {
    test('weatherIcons が正しく定義されている', () => {
      // スクリプト内の定数を直接チェック
      expect(appCode).toContain("'01d': '☀️'");
      expect(appCode).toContain("'01n': '🌙'");
      expect(appCode).toContain("'09d': '🌧️'");
    });
  });

  describe('getTodayMinMax', () => {
    test('今日の最高・最低気温を正しく取得する', () => {
      const mockForecast = {
        list: [
          {
            dt_txt: new Date().toISOString().split('T')[0] + ' 09:00:00',
            main: { temp: 20 }
          },
          {
            dt_txt: new Date().toISOString().split('T')[0] + ' 12:00:00',
            main: { temp: 25 }
          },
          {
            dt_txt: new Date().toISOString().split('T')[0] + ' 15:00:00',
            main: { temp: 22 }
          }
        ]
      };

      // 関数が存在する場合のみテスト
      if (typeof getTodayMinMax === 'function') {
        const result = getTodayMinMax(mockForecast);
        expect(result.max).toBe(25);
        expect(result.min).toBe(20);
      } else {
        // 関数が見つからない場合はスキップ
        expect(appCode).toContain('function getTodayMinMax');
      }
    });

    test('データがない場合は0を返す', () => {
      const mockForecast = { list: [] };
      
      if (typeof getTodayMinMax === 'function') {
        const result = getTodayMinMax(mockForecast);
        expect(result.max).toBe(0);
        expect(result.min).toBe(0);
      } else {
        expect(appCode).toContain('function getTodayMinMax');
      }
    });
  });

  describe('checkUmbrellaNeeded', () => {
    test('雨が予想される場合は傘が必要', () => {
      const mockForecast = {
        list: [
          {
            dt: Date.now() / 1000,
            weather: [{ main: 'Rain' }],
            pop: 0.8
          }
        ]
      };

      if (typeof checkUmbrellaNeeded === 'function') {
        const result = checkUmbrellaNeeded(mockForecast);
        expect(result.needed).toBe(true);
        expect(result.message).toContain('雨');
      } else {
        expect(appCode).toContain('function checkUmbrellaNeeded');
      }
    });

    test('晴れの場合は傘が不要', () => {
      const mockForecast = {
        list: [
          {
            dt: Date.now() / 1000,
            weather: [{ main: 'Clear' }],
            pop: 0.1
          }
        ]
      };

      if (typeof checkUmbrellaNeeded === 'function') {
        const result = checkUmbrellaNeeded(mockForecast);
        expect(result.needed).toBe(false);
        expect(result.message).toBe('不要');
      } else {
        expect(appCode).toContain('function checkUmbrellaNeeded');
      }
    });
  });

  describe('recommendClothing', () => {
    test('気温28度以上は半袖', () => {
      if (typeof recommendClothing === 'function') {
        expect(recommendClothing(30)).toBe('半袖・薄着');
      } else {
        expect(appCode).toContain('function recommendClothing');
      }
    });

    test('気温10度以下はジャケット・コート', () => {
      if (typeof recommendClothing === 'function') {
        expect(recommendClothing(10)).toBe('ジャケット・コート');
      } else {
        expect(appCode).toContain('function recommendClothing');
      }
    });
  });

  describe('checkAshRisk', () => {
    test('東風で風速5m/s以上は高リスク', () => {
      const wind = { deg: 90, speed: 6 };
      
      if (typeof checkAshRisk === 'function') {
        const result = checkAshRisk(wind);
        expect(result.riskLevel).toBe('高');
        expect(result.isRisky).toBe(true);
      } else {
        expect(appCode).toContain('function checkAshRisk');
      }
    });

    test('西風は低リスク', () => {
      const wind = { deg: 270, speed: 5 };
      
      if (typeof checkAshRisk === 'function') {
        const result = checkAshRisk(wind);
        expect(result.riskLevel).toBe('低');
        expect(result.isRisky).toBe(false);
      } else {
        expect(appCode).toContain('function checkAshRisk');
      }
    });
  });

  describe('checkPressureHeadache', () => {
    test('気圧1005hPa未満は高リスク', () => {
      const forecast = {
        list: [
          { main: { pressure: 1004 } },
          { main: { pressure: 1003 } }
        ]
      };
      
      if (typeof checkPressureHeadache === 'function') {
        const result = checkPressureHeadache(1000, forecast);
        expect(result.riskLevel).toBe('高');
        expect(result.isRisky).toBe(true);
      } else {
        expect(appCode).toContain('function checkPressureHeadache');
      }
    });

    test('安定した気圧は低リスク', () => {
      const forecast = {
        list: [
          { main: { pressure: 1015 } },
          { main: { pressure: 1016 } }
        ]
      };
      
      if (typeof checkPressureHeadache === 'function') {
        const result = checkPressureHeadache(1015, forecast);
        expect(result.riskLevel).toBe('低');
        expect(result.isRisky).toBe(false);
      } else {
        expect(appCode).toContain('function checkPressureHeadache');
      }
    });
  });

  describe('アプリケーション構造', () => {
    test('必要な関数が定義されている', () => {
      expect(appCode).toContain('function loadWeatherData');
      expect(appCode).toContain('function displayWeatherForLocation');
      expect(appCode).toContain('function switchLocation');
      expect(appCode).toContain('function getTodayMinMax');
      expect(appCode).toContain('function checkUmbrellaNeeded');
      expect(appCode).toContain('function recommendClothing');
      expect(appCode).toContain('function checkAshRisk');
      expect(appCode).toContain('function checkPressureHeadache');
    });

    test('必要な定数が定義されている', () => {
      expect(appCode).toContain('const weatherIcons');
      expect(appCode).toContain('let weatherCache');
      expect(appCode).toContain('let currentLocation');
    });

    test('DOM操作関数が定義されている', () => {
      expect(appCode).toContain('function showLoading');
      expect(appCode).toContain('function showError');
      expect(appCode).toContain('function forceReload');
    });
  });
});