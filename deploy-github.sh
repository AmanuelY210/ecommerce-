#!/bin/bash
# ETMarket GitHub Deploy Script
# Run this script to push the project to your GitHub repository
#
# Usage:
#   1. Make sure you have a GitHub Personal Access Token
#      Go to: https://github.com/settings/tokens
#      Click "Generate new token (classic)" → check "repo" scope → copy token
#
#   2. Run this script:
#      bash deploy-github.sh
#
#   3. When prompted, paste your GitHub token

set -e

REPO_URL="https://github.com/AmanuelY210/ecommerce-.git"
PROJECT_DIR="/home/z/my-project"

cd "$PROJECT_DIR"

echo "🚀 ETMarket GitHub Deploy"
echo "========================="
echo ""

# Check if remote exists
if git remote get-url origin &>/dev/null; then
    echo "✅ Remote 'origin' already configured"
else
    echo "📦 Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Ask for token
echo ""
echo "🔑 You need a GitHub Personal Access Token."
echo "   Create one at: https://github.com/settings/tokens"
echo "   (Check the 'repo' scope)"
echo ""
read -s -p "Paste your GitHub token: " TOKEN
echo ""

# Set remote URL with token
git remote set-url origin "https://AmanuelY210:${TOKEN}@github.com/AmanuelY210/ecommerce-.git"

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your project is now on GitHub:"
echo "   https://github.com/AmanuelY210/ecommerce-"
