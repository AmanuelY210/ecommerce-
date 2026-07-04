#!/bin/bash
# ╔══════════════════════════════════════════════╗
# ║  ETMarket → GitHub Deploy (3 easy steps)     ║
# ╚══════════════════════════════════════════════╝
#
# STEP 1: Get a GitHub token
#   → Go to: https://github.com/settings/tokens
#   → Click "Generate new token (classic)"
#   → Check "repo" scope → Generate → Copy token
#
# STEP 2: Run this script
#   bash deploy-github.sh
#
# STEP 3: Paste your token when asked
#
set -e
cd /home/z/my-project

echo "🚀 ETMarket → GitHub Deploy"
echo ""

# Ask for token
read -p "Paste your GitHub token (ghp_...): " TOKEN

# Set remote with token and push
git remote set-url origin "https://AmanuelY210:${TOKEN}@github.com/AmanuelY210/ecommerce-.git"

echo "📤 Pushing..."
git push -u origin main --force

echo ""
echo "✅ Done! View at: https://github.com/AmanuelY210/ecommerce-"
