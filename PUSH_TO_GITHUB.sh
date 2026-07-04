#!/bin/bash
# ╔════════════════════════════════════════════════════╗
# ║  ETMarket → GitHub — ONE COMMAND PUSH              ║
# ║                                                    ║
# ║  Just run:  bash PUSH_TO_GITHUB.sh YOUR_TOKEN      ║
# ║                                                    ║
# ║  Get token from: github.com/settings/tokens        ║
# ║  (Check "repo" scope, copy the ghp_... token)      ║
# ╚════════════════════════════════════════════════════╝

TOKEN="${1:-}"
if [ -z "$TOKEN" ]; then
  echo "❌ You need to provide your GitHub token!"
  echo ""
  echo "   How to get a token:"
  echo "   1. Go to: https://github.com/settings/tokens"
  echo "   2. Click 'Generate new token (classic)'"
  echo "   3. Check the 'repo' box"
  echo "   4. Click 'Generate token'"
  echo "   5. Copy the token (starts with ghp_)"
  echo ""
  echo "   Then run:"
  echo "   bash PUSH_TO_GITHUB.sh ghp_YOUR_TOKEN_HERE"
  echo ""
  exit 1
fi

cd /home/z/my-project

echo "🚀 Pushing ETMarket to GitHub..."
git remote set-url origin "https://AmanuelY210:${TOKEN}@github.com/AmanuelY210/ecommerce-.git"
git push -u origin main --force 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! Your code is now on GitHub:"
  echo "   https://github.com/AmanuelY210/ecommerce-"
else
  echo ""
  echo "❌ Push failed. Check your token is correct."
  echo "   Get a new token from: https://github.com/settings/tokens"
fi
