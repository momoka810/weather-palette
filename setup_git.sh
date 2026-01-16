#!/bin/bash
# GitHubリポジトリのセットアップスクリプト

echo "=========================================="
echo "Weather Palette - GitHub セットアップ"
echo "=========================================="
echo ""

# Gitリポジトリが既に初期化されているか確認
if [ -d ".git" ]; then
    echo "⚠️  Gitリポジトリは既に初期化されています。"
    read -p "続行しますか？ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Gitリポジトリを初期化
echo "📦 Gitリポジトリを初期化しています..."
git init

# すべてのファイルをステージング
echo "📝 ファイルをステージングしています..."
git add .

# 初回コミット
echo "💾 初回コミットを作成しています..."
git commit -m "Initial commit: Weather Palette - 服の色管理・コーデ提案Webツール"

echo ""
echo "✅ Gitリポジトリの初期化が完了しました！"
echo ""
echo "次のステップ:"
echo "1. GitHubで新しいリポジトリを作成してください"
echo "2. 以下のコマンドを実行してGitHubにプッシュしてください:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "詳細は DEPLOY.md を参照してください。"

