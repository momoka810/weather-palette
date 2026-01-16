# OpenWeather APIキー設定ガイド

## 401 Unauthorized エラーが出る場合

このエラーは、APIキーが無効であることを示しています。以下の手順で確認してください。

## 1. APIキーの取得手順

### ステップ1: アカウント作成
1. https://openweathermap.org/api にアクセス
2. 「Sign Up」をクリックしてアカウントを作成
3. メールアドレスを確認（確認メールが送られてくるので、リンクをクリック）

### ステップ2: APIキーの取得
1. https://home.openweathermap.org/api_keys にログイン
2. 「API keys」タブを開く
3. 「Create key」をクリック
4. キー名を入力（例: "Weather Palette"）
5. 「Generate」をクリック
6. 表示されたAPIキーをコピー

### ステップ3: APIキーの有効化
**重要**: 新しく作成したAPIキーは、有効化されるまで最大2時間かかることがあります。

- キーが有効になると、ステータスが「Active」になります
- ステータスが「Pending」の場合は、しばらく待ってから再度試してください

## 2. api_key.txtへの設定

```bash
# プロジェクトフォルダに移動
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"

# api_key.txtを編集
nano api_key.txt
```

以下の形式で記述してください：
```
OPENWEATHER_API_KEY=あなたの実際のAPIキー
```

例：
```
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

保存方法：
- `Ctrl + O` で保存
- `Enter` で確認
- `Ctrl + X` で終了

## 3. APIキーの確認方法

### ブラウザで直接テスト
以下のURLをブラウザで開いて、正しいレスポンスが返ってくるか確認してください：

```
https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=あなたのAPIキー&units=metric
```

正しい場合は、JSON形式の天気データが表示されます。
エラーの場合は、エラーメッセージが表示されます。

### よくあるエラー

- **401 Unauthorized**: APIキーが無効、またはまだ有効化されていない
- **Invalid API key**: APIキーの形式が間違っている
- **API key not activated**: APIキーがまだ有効化されていない（最大2時間待つ必要がある）

## 4. トラブルシューティング

### APIキーが正しく設定されているか確認
```bash
cat "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette/api_key.txt"
```

出力例：
```
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### 注意事項
- APIキーの前後に余分なスペースがないか確認
- `OPENWEATHER_API_KEY=` の部分が正しく記述されているか確認
- 改行が含まれていないか確認

## 5. 無料プランの制限

OpenWeather APIの無料プランには以下の制限があります：
- 1分間に60リクエストまで
- 1日に1,000,000リクエストまで

これらの制限を超えると、一時的にエラーが発生する場合があります。

