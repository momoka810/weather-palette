// データ管理
const Storage = {
    // 色データの読み込み
    loadColors() {
        const saved = localStorage.getItem('wardrobeColors');
        if (saved) {
            return JSON.parse(saved);
        }
        // 初期データ（サンプル）
        return {
            tops: [
                { id: 1, color: '#FFFFFF', name: '白' },
                { id: 2, color: '#000000', name: '黒' },
                { id: 3, color: '#3498DB', name: 'ブルー' },
                { id: 4, color: '#E74C3C', name: '赤' }
            ],
            bottoms: [
                { id: 1, color: '#2C3E50', name: 'ネイビー' },
                { id: 2, color: '#95A5A6', name: 'グレー' }
            ],
            outer: [
                { id: 1, color: '#34495E', name: 'ダークグレー' }
            ],
            accessories: []
        };
    },

    // 色データの保存
    saveColors(colors) {
        localStorage.setItem('wardrobeColors', JSON.stringify(colors));
    },

    // 提案履歴の読み込み
    loadHistory() {
        const saved = localStorage.getItem('suggestionHistory');
        return saved ? JSON.parse(saved) : [];
    },

    // 提案履歴の保存
    saveHistory(history) {
        localStorage.setItem('suggestionHistory', JSON.stringify(history));
    },

    // 位置情報の読み込み
    loadLocation() {
        const saved = localStorage.getItem('location');
        return saved ? JSON.parse(saved) : { city: 'Osaka' };
    },

    // 位置情報の保存
    saveLocation(location) {
        localStorage.setItem('location', JSON.stringify(location));
    },

    // 天気情報の読み込み
    loadWeather() {
        const saved = localStorage.getItem('weather');
        return saved ? JSON.parse(saved) : null;
    },

    // 天気情報の保存
    saveWeather(weather) {
        localStorage.setItem('weather', JSON.stringify(weather));
    }
};

// アプリケーションの状態管理
const App = {
    colors: Storage.loadColors(),
    currentCategory: 'tops',
    currentScene: 'work',
    nextId: 100,
    location: Storage.loadLocation(),
    apiKey: null,

    async init() {
        await this.loadApiKey();
        this.setupEventListeners();
        this.renderWardrobe();
        this.loadWeatherData();
        this.updateNextId();
    },

    async loadApiKey() {
        // 複数の場所からAPIキーを読み込む（優先順位順）
        const apiKeyFiles = [
            '../api_key.txt',  // 親ディレクトリのapi_key.txt
            'api_key.txt'      // プロジェクト内のapi_key.txt
        ];

        for (const filePath of apiKeyFiles) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    const text = await response.text();
                    let key = text.trim();
                    
                    console.log(`${filePath}の内容を読み込みました`);
                    
                    // KEY=value形式の場合、OPENWEATHER_API_KEYを探す
                    if (key.includes('=')) {
                        const lines = text.split('\n');
                        let found = false;
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('OPENWEATHER_API_KEY=')) {
                                key = trimmed.split('=')[1].trim();
                                found = true;
                                console.log('OpenWeather APIキーを検出:', key ? 'あり' : 'なし');
                                break;
                            }
                        }
                        if (!found) {
                            console.warn(`${filePath}にOPENWEATHER_API_KEYが見つかりませんでした。`);
                            continue; // 次のファイルを試す
                        }
                    }
                    
                    this.apiKey = key;
                    // プレースホルダーや空文字列の場合はnullにする
                    if (this.apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE' || 
                        this.apiKey === '' || 
                        this.apiKey.startsWith('OPENWEATHER_API_KEY=') ||
                        this.apiKey.startsWith('OPENAI_API_KEY=')) {
                        console.warn('APIキーが無効です:', this.apiKey);
                        this.apiKey = null;
                        continue; // 次のファイルを試す
                    } else {
                        console.log(`APIキーが正常に読み込まれました（${filePath}から）。`);
                        return; // 成功したら終了
                    }
                }
            } catch (error) {
                console.log(`${filePath}が見つかりませんでした。次の場所を試します...`);
                continue; // 次のファイルを試す
            }
        }
        
        // すべてのファイルで見つからなかった場合
        console.error('api_key.txtが見つかりませんでした。以下の場所を確認してください:');
        console.error('1. ../api_key.txt (親ディレクトリ)');
        console.error('2. api_key.txt (プロジェクト内)');
        this.apiKey = null;
    },

    updateNextId() {
        let maxId = 0;
        Object.values(this.colors).forEach(category => {
            category.forEach(item => {
                if (item.id > maxId) maxId = item.id;
            });
        });
        this.nextId = maxId + 1;
    },

    setupEventListeners() {
        // ナビゲーション
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });

        // カテゴリタブ
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.renderWardrobe();
            });
        });

        // シーンボタン
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentScene = e.target.dataset.scene;
            });
        });

        // 気温スライダー
        const tempInput = document.getElementById('temperature-input');
        const tempValue = document.getElementById('temperature-value');
        tempInput.addEventListener('input', (e) => {
            tempValue.textContent = e.target.value;
        });

        // 色追加
        document.getElementById('add-color-btn').addEventListener('click', () => {
            this.addColor();
        });

        // カラーピッカーとテキスト入力の同期
        const colorPicker = document.getElementById('color-picker');
        const colorHex = document.getElementById('color-hex');
        colorPicker.addEventListener('input', (e) => {
            colorHex.value = e.target.value.toUpperCase();
        });
        colorHex.addEventListener('input', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                colorPicker.value = value;
            }
        });

        // プリセット色
        document.querySelectorAll('.preset-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                colorPicker.value = color;
                colorHex.value = color.toUpperCase();
            });
        });

        // コーデ提案
        document.getElementById('suggest-btn').addEventListener('click', () => {
            this.suggestOutfit();
        });

        // 天気更新
        document.getElementById('refresh-weather-btn').addEventListener('click', () => {
            this.loadWeatherData();
        });

        // 都市設定
        document.getElementById('set-city-btn').addEventListener('click', () => {
            const city = document.getElementById('city-input').value.trim();
            if (city) {
                this.location = { city: city };
                Storage.saveLocation(this.location);
                this.loadWeatherData();
            }
        });
    },

    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`${page}-page`).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        if (page === 'wardrobe') {
            this.renderWardrobe();
        }
    },

    renderWardrobe() {
        const container = document.getElementById('color-chips');
        const categoryColors = this.colors[this.currentCategory] || [];
        
        // カテゴリタブの更新
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === this.currentCategory) {
                tab.classList.add('active');
            }
        });

        if (categoryColors.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #7F8C8D; padding: 2rem;">色が登録されていません</div>';
            return;
        }

        container.innerHTML = categoryColors.map(item => `
            <div class="color-chip" style="background-color: ${item.color};" data-id="${item.id}">
                <button class="delete-btn" onclick="App.deleteColor(${item.id})">×</button>
                <div class="color-name">${item.name || item.color}</div>
            </div>
        `).join('');
    },

    addColor() {
        const colorPicker = document.getElementById('color-picker');
        const color = colorPicker.value.toUpperCase();
        const category = this.currentCategory;

        if (!this.colors[category]) {
            this.colors[category] = [];
        }

        const newColor = {
            id: this.nextId++,
            color: color,
            name: this.getColorName(color)
        };

        this.colors[category].push(newColor);
        Storage.saveColors(this.colors);
        this.renderWardrobe();
    },

    deleteColor(id) {
        const category = this.currentCategory;
        this.colors[category] = this.colors[category].filter(item => item.id !== id);
        Storage.saveColors(this.colors);
        this.renderWardrobe();
    },

    getColorName(hex) {
        // 簡易的な色名判定
        const colorMap = {
            '#FFFFFF': '白', '#000000': '黒', '#808080': 'グレー',
            '#FF0000': '赤', '#FFA500': 'オレンジ', '#FFC0CB': 'ピンク',
            '#0000FF': '青', '#1E90FF': '水色', '#2C3E50': 'ネイビー',
            '#008000': '緑', '#800080': '紫', '#FFD700': 'ゴールド',
            '#F5DEB3': 'ベージュ', '#FF5733': 'コーラル', '#00CED1': 'ターコイズ'
        };
        return colorMap[hex] || hex;
    },

    async loadWeatherData() {
        const weatherInfo = document.getElementById('weather-info');
        weatherInfo.innerHTML = '<div class="weather-loading">天気情報を取得中...</div>';

        try {
            // 位置情報の取得を試みる
            let city = this.location.city || 'Osaka';
            
            // Geolocation APIを試す（ユーザー許可が必要）
            if (navigator.geolocation && !this.location.city) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        await this.fetchWeatherByCoords(lat, lon);
                    },
                    async () => {
                        // 位置情報取得失敗時は都市名で取得
                        await this.fetchWeatherByCity(city);
                    }
                );
            } else {
                await this.fetchWeatherByCity(city);
            }
        } catch (error) {
            console.error('天気情報の取得に失敗しました:', error);
            this.displayWeatherError('天気情報を取得できませんでした。手動で気温を入力してください。');
        }
    },

    async fetchWeatherByCity(city) {
        try {
            // まずOpen-Meteo API（APIキー不要）を試す
            console.log('天気情報を取得中... 都市:', city);
            
            // Open-Meteo Geocoding APIで都市名から緯度経度を取得
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ja&format=json`;
            const geocodeResponse = await fetch(geocodeUrl);
            
            if (!geocodeResponse.ok) {
                throw new Error('都市情報の取得に失敗しました');
            }
            
            const geocodeData = await geocodeResponse.json();
            if (!geocodeData.results || geocodeData.results.length === 0) {
                throw new Error(`都市「${city}」が見つかりませんでした。`);
            }
            
            const location = geocodeData.results[0];
            const lat = location.latitude;
            const lon = location.longitude;
            const cityName = location.name;
            
            // Open-Meteo Weather APIで天気情報を取得（APIキー不要）
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                throw new Error('天気情報の取得に失敗しました');
            }
            
            const weatherData = await weatherResponse.json();
            
            // Open-MeteoのデータをOpenWeather形式に変換
            const convertedData = {
                name: cityName,
                main: {
                    temp: weatherData.current.temperature_2m,
                    temp_max: weatherData.daily.temperature_2m_max[0],
                    temp_min: weatherData.daily.temperature_2m_min[0]
                },
                weather: [{
                    main: this.convertWeatherCode(weatherData.current.weather_code),
                    description: this.convertWeatherCode(weatherData.current.weather_code),
                    icon: this.getWeatherIcon(weatherData.current.weather_code)
                }]
            };
            
            console.log('天気情報を取得しました:', convertedData);
            this.displayWeather(convertedData);
            this.updateTemperatureInput(convertedData.main.temp);
        } catch (error) {
            console.error('天気情報の取得エラー:', error);
            this.displayWeatherError(error.message || '天気情報を取得できませんでした。手動で気温を入力してください。');
        }
    },
    
    convertWeatherCode(code) {
        // WMO Weather interpretation codes (WW)
        const weatherCodes = {
            0: '快晴', 1: '晴れ', 2: '所により曇り', 3: '曇り',
            45: '霧', 48: '霧', 51: '小雨', 53: '雨', 55: '雨',
            56: '凍雨', 57: '凍雨', 61: '雨', 63: '雨', 65: '雨',
            66: '凍雨', 67: '凍雨', 71: '雪', 73: '雪', 75: '雪',
            77: '雪', 80: 'にわか雨', 81: 'にわか雨', 82: 'にわか雨',
            85: 'にわか雪', 86: 'にわか雪', 95: '雷雨', 96: '雷雨', 99: '雷雨'
        };
        return weatherCodes[code] || '不明';
    },
    
    getWeatherIcon(code) {
        // 天気コードからアイコンを決定
        if (code === 0 || code === 1) return '01d';
        if (code === 2) return '02d';
        if (code === 3) return '03d';
        if (code >= 45 && code <= 48) return '50d';
        if (code >= 51 && code <= 67) return '09d';
        if (code >= 71 && code <= 86) return '13d';
        if (code >= 95 && code <= 99) return '11d';
        return '01d';
    },

    async fetchWeatherByCoords(lat, lon) {
        try {
            console.log('天気情報を取得中... 緯度:', lat, '経度:', lon);
            
            // Open-Meteo Weather APIで天気情報を取得（APIキー不要）
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                throw new Error('天気情報の取得に失敗しました');
            }
            
            const weatherData = await weatherResponse.json();
            
            // 逆ジオコーディングで都市名を取得
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=ja&format=json`;
            const geocodeResponse = await fetch(geocodeUrl);
            let cityName = '現在地';
            
            if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                if (geocodeData.results && geocodeData.results.length > 0) {
                    cityName = geocodeData.results[0].name;
                }
            }
            
            // Open-MeteoのデータをOpenWeather形式に変換
            const convertedData = {
                name: cityName,
                main: {
                    temp: weatherData.current.temperature_2m,
                    temp_max: weatherData.daily.temperature_2m_max[0],
                    temp_min: weatherData.daily.temperature_2m_min[0]
                },
                weather: [{
                    main: this.convertWeatherCode(weatherData.current.weather_code),
                    description: this.convertWeatherCode(weatherData.current.weather_code),
                    icon: this.getWeatherIcon(weatherData.current.weather_code)
                }]
            };
            
            console.log('天気情報を取得しました:', convertedData);
            this.location = { city: cityName, lat: lat, lon: lon };
            Storage.saveLocation(this.location);
            document.getElementById('city-input').value = cityName;
            this.displayWeather(convertedData);
            this.updateTemperatureInput(convertedData.main.temp);
        } catch (error) {
            console.error('天気情報の取得エラー:', error);
            this.displayWeatherError(error.message || '天気情報を取得できませんでした。手動で気温を入力してください。');
        }
    },

    getApiKey() {
        // api_key.txtから読み込んだAPIキーを返す
        return this.apiKey;
    },

    displayWeather(data) {
        const weatherInfo = document.getElementById('weather-info');
        const weather = data.weather[0];
        const main = data.main;
        const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

        weatherInfo.innerHTML = `
            <img src="${iconUrl}" alt="${weather.description}" class="weather-icon">
            <div class="weather-details">
                <div class="weather-temp">${Math.round(main.temp)}℃</div>
                <div class="weather-desc">${weather.description}</div>
                <div class="weather-temps">
                    <span>最高: ${Math.round(main.temp_max)}℃</span>
                    <span>最低: ${Math.round(main.temp_min)}℃</span>
                </div>
            </div>
        `;

        // 天気情報を保存
        Storage.saveWeather({
            temp: main.temp,
            tempMax: main.temp_max,
            tempMin: main.temp_min,
            description: weather.description,
            icon: weather.icon,
            city: data.name,
            lastUpdated: new Date().toISOString()
        });
    },

    displayWeatherError(message = '天気情報を取得できませんでした。手動で気温を入力してください。') {
        const weatherInfo = document.getElementById('weather-info');
        const cachedWeather = Storage.loadWeather();
        
        if (cachedWeather) {
            // キャッシュされた天気情報を表示
            const iconUrl = `https://openweathermap.org/img/wn/${cachedWeather.icon}@2x.png`;
            weatherInfo.innerHTML = `
                <img src="${iconUrl}" alt="${cachedWeather.description}" class="weather-icon">
                <div class="weather-details">
                    <div class="weather-temp">${Math.round(cachedWeather.temp)}℃</div>
                    <div class="weather-desc">${cachedWeather.description} (キャッシュ)</div>
                    <div class="weather-temps">
                        <span>最高: ${Math.round(cachedWeather.tempMax)}℃</span>
                        <span>最低: ${Math.round(cachedWeather.tempMin)}℃</span>
                    </div>
                </div>
            `;
            this.updateTemperatureInput(cachedWeather.temp);
        } else {
            weatherInfo.innerHTML = `
                <div style="color: #7F8C8D; text-align: center; padding: 1rem;">
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">🌤️</div>
                    <div style="margin-bottom: 0.5rem;">${message}</div>
                    <small style="display: block; margin-top: 0.5rem;">
                        気温スライダーで手動で気温を設定できます。
                    </small>
                </div>
            `;
        }
    },

    updateTemperatureInput(temp) {
        const tempInput = document.getElementById('temperature-input');
        const tempValue = document.getElementById('temperature-value');
        const roundedTemp = Math.round(temp);
        tempInput.value = roundedTemp;
        tempValue.textContent = roundedTemp;
    },

    suggestOutfit() {
        const temp = parseInt(document.getElementById('temperature-input').value);
        const scene = this.currentScene;
        const weather = Storage.loadWeather();

        // 提案ロジック
        const suggestion = this.generateSuggestion(temp, scene, weather);
        this.displaySuggestion(suggestion);
        this.saveSuggestionHistory(suggestion);
    },

    generateSuggestion(temp, scene, weather) {
        const suggestion = {
            temperature: temp,
            scene: scene,
            combination: {},
            description: ''
        };

        // 気温によるカテゴリ選択
        const needsOuter = temp <= 15;
        const outerOptional = temp > 15 && temp < 25;

        // 利用可能な色を取得
        const tops = this.colors.tops || [];
        const bottoms = this.colors.bottoms || [];
        const outer = this.colors.outer || [];
        const accessories = this.colors.accessories || [];

        if (tops.length === 0 || bottoms.length === 0) {
            return {
                error: 'トップスとボトムスが登録されていません。マイ服棚で色を追加してください。'
            };
        }

        // シーンと天気に応じた色の選定
        const sceneColors = this.getSceneAppropriateColors(scene, weather);
        
        // トップスを選択
        const selectedTops = this.selectColor(tops, sceneColors);
        suggestion.combination.tops = selectedTops;

        // ボトムスを選択
        const selectedBottoms = this.selectColor(bottoms, sceneColors);
        suggestion.combination.bottoms = selectedBottoms;

        // アウターを選択（必要な場合）
        if (needsOuter && outer.length > 0) {
            const selectedOuter = this.selectColor(outer, sceneColors);
            suggestion.combination.outer = selectedOuter;
        } else if (outerOptional && outer.length > 0 && Math.random() > 0.5) {
            const selectedOuter = this.selectColor(outer, sceneColors);
            suggestion.combination.outer = selectedOuter;
        }

        // 小物を選択（オプション）
        if (accessories.length > 0 && Math.random() > 0.7) {
            const selectedAccessory = this.selectColor(accessories, sceneColors);
            suggestion.combination.accessories = selectedAccessory;
        }

        // 説明文を生成
        suggestion.description = this.generateDescription(suggestion, temp, scene, weather);

        return suggestion;
    },

    getSceneAppropriateColors(scene, weather) {
        // 会社: 無彩色、落ち着いた色
        // 休日: 明るい色、ビビッドカラー
        // 雨・曇り: 暗めの色
        // 晴れ: 明るい色

        const isWork = scene === 'work';
        const isRainy = weather && (weather.description.includes('雨') || weather.description.includes('曇'));
        const isSunny = weather && weather.description.includes('晴');

        if (isWork) {
            return {
                preferred: ['#FFFFFF', '#000000', '#808080', '#2C3E50', '#34495E', '#95A5A6'],
                avoid: ['#FF0000', '#FFA500', '#FFD700', '#FFC0CB']
            };
        } else {
            if (isRainy) {
                return {
                    preferred: ['#2C3E50', '#34495E', '#95A5A6', '#808080'],
                    avoid: []
                };
            } else if (isSunny) {
                return {
                    preferred: ['#FF5733', '#3498DB', '#FFC0CB', '#FFD700', '#00CED1'],
                    avoid: []
                };
            } else {
                return {
                    preferred: [],
                    avoid: []
                };
            }
        }
    },

    selectColor(colors, sceneColors) {
        if (colors.length === 0) return null;

        // 過去7日間の履歴を確認して重複を避ける
        const history = Storage.loadHistory();
        const recentHistory = history.filter(h => {
            const historyDate = new Date(h.date);
            const now = new Date();
            const daysDiff = (now - historyDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        // シーンに適した色を優先
        let candidates = colors;
        if (sceneColors.preferred.length > 0) {
            const preferred = colors.filter(c => 
                sceneColors.preferred.includes(c.color.toUpperCase())
            );
            if (preferred.length > 0) {
                candidates = preferred;
            }
        }

        // 避けるべき色を除外
        if (sceneColors.avoid.length > 0) {
            candidates = candidates.filter(c => 
                !sceneColors.avoid.includes(c.color.toUpperCase())
            );
        }

        if (candidates.length === 0) {
            candidates = colors;
        }

        // ランダムに選択（重複を避ける）
        let selected = candidates[Math.floor(Math.random() * candidates.length)];
        
        // 重複チェック（簡易版）
        const recentCombinations = recentHistory.map(h => h.combination);
        let attempts = 0;
        while (attempts < 10 && this.isDuplicate(selected, recentCombinations)) {
            selected = candidates[Math.floor(Math.random() * candidates.length)];
            attempts++;
        }

        return selected;
    },

    isDuplicate(color, recentCombinations) {
        // 簡易的な重複チェック
        return recentCombinations.some(combo => {
            return Object.values(combo).some(c => c && c.id === color.id);
        });
    },

    generateDescription(suggestion, temp, scene, weather) {
        const parts = [];
        
        if (temp <= 10) {
            parts.push('寒い日なので、アウターをしっかり着用しましょう。');
        } else if (temp <= 20) {
            parts.push('少し肌寒い日です。');
        } else {
            parts.push('暖かい日です。');
        }

        if (scene === 'work') {
            parts.push('落ち着いたトーンで統一したコーデです。');
        } else {
            parts.push('カジュアルなコーデです。');
        }

        if (weather) {
            if (weather.description.includes('雨')) {
                parts.push('雨の日なので、暗めの色を選びました。');
            } else if (weather.description.includes('晴')) {
                parts.push('晴れの日なので、明るい色を選びました。');
            }
        }

        return parts.join(' ');
    },

    displaySuggestion(suggestion) {
        const resultCard = document.getElementById('suggestion-result');
        
        if (suggestion.error) {
            resultCard.innerHTML = `
                <div class="result-placeholder" style="color: #E74C3C;">
                    ${suggestion.error}
                </div>
            `;
            return;
        }

        const combination = suggestion.combination;
        let html = '<div class="suggestion-result">';
        html += '<h3 class="suggestion-title">今日のコーデ提案</h3>';
        html += '<div class="suggestion-combination">';

        if (combination.tops) {
            html += `
                <div class="combination-item">
                    <div class="combination-label">トップス</div>
                    <div class="combination-chip" style="background-color: ${combination.tops.color};"></div>
                    <div style="font-size: 0.75rem; color: #7F8C8D;">${combination.tops.name || combination.tops.color}</div>
                </div>
            `;
        }

        if (combination.bottoms) {
            html += `
                <div class="combination-item">
                    <div class="combination-label">ボトムス</div>
                    <div class="combination-chip" style="background-color: ${combination.bottoms.color};"></div>
                    <div style="font-size: 0.75rem; color: #7F8C8D;">${combination.bottoms.name || combination.bottoms.color}</div>
                </div>
            `;
        }

        if (combination.outer) {
            html += `
                <div class="combination-item">
                    <div class="combination-label">アウター</div>
                    <div class="combination-chip" style="background-color: ${combination.outer.color};"></div>
                    <div style="font-size: 0.75rem; color: #7F8C8D;">${combination.outer.color}</div>
                </div>
            `;
        }

        if (combination.accessories) {
            html += `
                <div class="combination-item">
                    <div class="combination-label">小物</div>
                    <div class="combination-chip" style="background-color: ${combination.accessories.color};"></div>
                    <div style="font-size: 0.75rem; color: #7F8C8D;">${combination.accessories.color}</div>
                </div>
            `;
        }

        html += '</div>';
        html += `<div class="suggestion-description">${suggestion.description}</div>`;
        html += '</div>';

        resultCard.innerHTML = html;
    },

    saveSuggestionHistory(suggestion) {
        if (suggestion.error) return;

        const history = Storage.loadHistory();
        history.push({
            date: new Date().toISOString(),
            temperature: suggestion.temperature,
            scene: suggestion.scene,
            combination: suggestion.combination
        });

        // 過去30日分のみ保持
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filteredHistory = history.filter(h => new Date(h.date) >= thirtyDaysAgo);

        Storage.saveHistory(filteredHistory);
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

