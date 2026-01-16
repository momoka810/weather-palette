#!/bin/bash
# ローカルサーバーを起動するスクリプト

echo "Weather Palette ローカルサーバーを起動します..."
echo ""
echo "ブラウザで以下のURLにアクセスしてください:"
echo "http://localhost:8000"
echo ""
echo "サーバーを停止するには Ctrl+C を押してください"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000

