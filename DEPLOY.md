# Render デプロイガイド

このガイドでは、Weather PaletteをRenderで公開する手順を説明します。

## 前提条件

- GitHubアカウント
- Renderアカウント（https://render.com で無料登録可能）

## デプロイ手順

### 1. GitHubリポジトリの作成

1. GitHubにログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `weather-palette`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

### 2. ローカルでGitリポジトリを初期化

```bash
# プロジェクトフォルダに移動
cd "/Users/momokaiwasaki/Documents/AIエンジニア講座/5-3-2 他の人が使えるツール Weather Palette"

# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Weather Palette"

# GitHubリポジトリをリモートとして追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### 3. Renderでデプロイ

1. **Renderにログイン**
   - https://render.com にアクセス
   - GitHubアカウントでログイン

2. **新しいStatic Siteを作成**
   - ダッシュボードで「New +」→「Static Site」をクリック
   - 「Connect GitHub」をクリックしてリポジトリを選択

3. **設定を入力**
   - **Name**: `weather-palette`（任意の名前）
   - **Branch**: `main`
   - **Root Directory**: （空白のまま）
   - **Build Command**: （空白のまま）
   - **Publish Directory**: （空白のまま）

4. **デプロイ**
   - 「Create Static Site」をクリック
   - 数分待つとデプロイが完了します
   - 自動的にURLが生成されます（例: `https://weather-palette.onrender.com`）

### 4. カスタムドメイン（オプション）

1. Renderのダッシュボードでサイトを選択
2. 「Settings」タブを開く
3. 「Custom Domains」セクションでドメインを追加

## 注意事項

- **APIキー**: このアプリケーションはAPIキー不要で動作します（Open-Meteo APIを使用）
- **HTTPS**: Renderは自動的にHTTPSを提供します
- **無料プラン**: Renderの無料プランでは、15分間アクセスがないとスリープします。次回アクセス時に自動的に起動します（数秒かかります）

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドログを確認**
   - Renderのダッシュボードで「Logs」タブを確認
   - エラーメッセージを確認

2. **ファイルパスの確認**
   - `index.html`がルートディレクトリにあることを確認
   - すべてのファイルがコミットされていることを確認

3. **.gitignoreの確認**
   - `api_key.txt`がコミットされていないことを確認（セキュリティ上重要）

### サイトが表示されない場合

1. **URLを確認**
   - Renderのダッシュボードで正しいURLを確認
   - スリープしている場合は、数秒待ってから再アクセス

2. **ブラウザのコンソールを確認**
   - 開発者ツール（F12）でエラーを確認

## 更新方法

コードを更新したら、以下のコマンドでGitHubにプッシュすると、Renderが自動的に再デプロイします：

```bash
git add .
git commit -m "Update: 変更内容の説明"
git push origin main
```

Renderは自動的に変更を検知して再デプロイします（数分かかります）。

