# Weather Palette - 服の色管理・コーデ提案Webツール

服の色を可視化して管理し、天気とシーンに応じて今日のコーデを提案するWebアプリケーションです。

## 機能

- **色管理**: 持っている服の色を色チップで視覚的に管理
- **天気自動取得**: OpenWeather APIを使用して現在の天気と気温を自動取得
- **コーデ提案**: 気温・シーン・天気に応じたコーデを自動提案
- **重複回避**: 過去7日間の提案履歴を考慮して、同じ組み合わせを避ける

## セットアップ

**重要**: このアプリケーションは**APIキー不要**で動作します。Open-Meteo API（完全無料、APIキー不要）を使用しています。

### 1. セットアップ不要！

このアプリケーションは、すぐに使用できます。APIキーの設定は不要です。

### 2. （オプション）APIキーの設定

APIキーは以下のいずれかの場所に保存できます（優先順位順）：

1. **親ディレクトリのapi_key.txt**（推奨）
   - 場所: `/Users/momokaiwasaki/Documents/AIエンジニア講座/api_key.txt`
   - 複数のプロジェクトで同じAPIキーを使い回す場合に便利

2. **プロジェクト内のapi_key.txt**
   - 場所: プロジェクトフォルダ内の`api_key.txt`
   - このプロジェクト専用のAPIキーを設定する場合

#### 設定方法

**方法1: 親ディレクトリのapi_key.txtを使用（推奨）**

```bash
# 親ディレクトリのapi_key.txtを編集
nano "/Users/momokaiwasaki/Documents/AIエンジニア講座/api_key.txt"
```

以下の形式で記述してください：
```
OPENWEATHER_API_KEY=あなたのOpenWeather_APIキー
```

例：
```
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**方法2: プロジェクト内のapi_key.txtを使用**

```bash
# プロジェクトフォルダに移動
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"

# api_key.txt.example を api_key.txt にコピー
cp api_key.txt.example api_key.txt

# 編集
nano api_key.txt
```

**注意**: 
- 既に`OPENAI_API_KEY`などが書かれている場合は、`OPENWEATHER_API_KEY=`の行を追加してください
- 親ディレクトリとプロジェクト内の両方にファイルがある場合、親ディレクトリのものが優先されます

### 3. ローカルサーバーで起動（必須）

このアプリケーションは、ブラウザのセキュリティ制限により、ローカルサーバー経由で起動する必要があります。

**重要**: 必ずプロジェクトフォルダ内でサーバーを起動してください。

#### 方法1: 起動スクリプトを使用（推奨）

```bash
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"
./start_server.sh
```

#### 方法2: Python 3を使用する場合

```bash
# プロジェクトフォルダに移動
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"

# サーバーを起動
python3 -m http.server 8000
```

#### 方法3: Node.jsを使用する場合

```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# プロジェクトフォルダに移動
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"

# サーバーを起動
http-server -p 8000
```

#### 方法4: VS CodeのLive Server拡張機能を使用する場合

1. VS Codeでこのフォルダを開く
2. `index.html` を右クリック
3. "Open with Live Server" を選択

### 4. ブラウザでアクセス

http://localhost:8000 にアクセスしてください。

**注意**: ファイルを直接開く（`file://`プロトコル）では動作しません。必ずローカルサーバー経由でアクセスしてください。

## 使い方

### 色の追加

1. 「マイ服棚」タブをクリック
2. カテゴリ（トップス、ボトムス、アウター、小物）を選択
3. カラーピッカーまたはプリセット色から色を選択
4. 「色を追加」ボタンをクリック

### コーデの提案

1. 「コーデ提案」タブをクリック
2. 天気情報が自動的に取得されます（初回は位置情報の許可が必要）
3. 必要に応じて気温を調整
4. シーン（会社／休日）を選択
5. 「コーデを提案」ボタンをクリック

### 天気情報の更新

- 「更新」ボタンをクリックすると、最新の天気情報を取得します
- 都市名を変更したい場合は、都市名を入力して「都市を設定」ボタンをクリック

## データの保存

すべてのデータはブラウザのローカルストレージに保存されます：
- 色データ（カテゴリ別）
- 提案履歴（過去30日分）
- 位置情報・天気情報

## 注意事項

- **APIキーの管理**: `api_key.txt` ファイルは `.gitignore` に追加されているため、Gitにコミットされません
- **CORSエラー**: ブラウザのセキュリティ制限により、`file://` プロトコルでは動作しません。必ずローカルサーバー経由で起動してください
- **位置情報**: 初回起動時に位置情報の許可を求められます。許可しない場合は、都市名を手動で入力してください

## トラブルシューティング

### 「APIキーが設定されていません」というエラーが出る場合

1. **api_key.txtファイルの確認**
   ```bash
   cat api_key.txt
   ```
   以下の形式で記述されているか確認してください：
   ```
   OPENWEATHER_API_KEY=あなたの実際のAPIキー
   ```

2. **ローカルサーバーで起動しているか確認**
   - `file://`プロトコル（ファイルを直接開く）では動作しません
   - 必ず `python3 -m http.server 8000` などでローカルサーバーを起動してください
   - ブラウザのアドレスバーが `http://localhost:8000` になっているか確認

3. **ブラウザの開発者ツールで確認**
   - `F12`キーを押して開発者ツールを開く
   - 「Console」タブでエラーメッセージを確認
   - `api_key.txtの内容:` というログが表示されているか確認

4. **APIキーの有効性を確認**
   - OpenWeather APIのダッシュボード（https://home.openweathermap.org/api_keys）でキーが有効か確認
   - キーが無効化されていないか確認
   - Freeプランの制限（1分間に60リクエスト）を超えていないか確認

5. **ブラウザのキャッシュをクリア**
   - `Ctrl + Shift + R`（Windows/Linux）または `Cmd + Shift + R`（Mac）で強制リロード
   - またはブラウザのキャッシュをクリア

### 天気情報が取得できない場合

- 都市名が正しいか確認（英語表記、例: Tokyo, Osaka）
- ネットワーク接続を確認
- OpenWeather APIのステータスを確認（https://status.openweathermap.org/）

## 技術スタック

- HTML5 / CSS3
- Vanilla JavaScript
- Open-Meteo API（APIキー不要、完全無料）
- LocalStorage API
- Geolocation API

## 開発・デプロイ

- **ローカル開発**: ローカルサーバーで起動（`python3 -m http.server 8000`）
- **デプロイ**: Render（静的サイトホスティング）
- **バージョン管理**: GitHub

## デプロイ

このアプリケーションはRenderで簡単にデプロイできます。詳細は [DEPLOY.md](./DEPLOY.md) を参照してください。

### クイックデプロイ（Render）

1. GitHubにリポジトリをプッシュ
2. Renderで「New Static Site」を作成
3. GitHubリポジトリを選択
4. デプロイ完了！

詳細な手順は [DEPLOY.md](./DEPLOY.md) を参照してください。

## ライセンス

このプロジェクトは個人利用・学習目的で自由に使用できます。

