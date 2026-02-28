#!/bin/bash

# Setup script for Poker Spinner PWA

echo "Poker Decision Spinner - GitHub Pages Setup"
echo "============================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing git..."
  git init
fi

# Create .gitignore
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
.DS_Store
Thumbs.db
EOF

# Add files
echo "Adding files to git..."
git add manifest.json poker-spinner.html service-worker.js

# Create initial commit
echo "Creating commit..."
git commit -m "Initial commit: Poker Decision Spinner PWA"

echo ""
echo "============================================"
echo "NEXT STEPS (do these manually):"
echo "============================================"
echo ""
echo "1. Create a new GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name it 'poker-spinner'"
echo "   - Don't check 'Add a README file'"
echo "   - Click 'Create repository'"
echo ""
echo "2. Push your code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/poker-spinner.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to your repo on GitHub"
echo "   - Settings > Pages"
echo "   - Under 'Build and deployment', select 'main' branch"
echo "   - Click Save"
echo ""
echo "4. Your app will be at:"
echo "   https://YOUR_USERNAME.github.io/poker-spinner/"
echo ""
echo "5. On iPhone:"
echo "   - Open the URL in Safari"
echo "   - Tap Share > Add to Home Screen"
