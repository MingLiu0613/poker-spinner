# Poker Decision Spinner

A Texas Hold'em fortune spinner that helps poker players make decisions. Built as a PWA (Progressive Web App) that works on iPhone.

## Features

- Set call percentage (0-100%)
- Cryptographically secure random number generation
- Visual spinning wheel with numbers 0-99
- Works offline after first load
- Add to iPhone home screen for app-like experience

## How to Use

1. Set your call probability (e.g., 62% = 62% call, 38% fold)
2. Click SPIN
3. The wheel lands on a number 0-99
   - Numbers 0-(call%-1) = CALL
   - Numbers call%-99 = FOLD

## Installation

### iPhone
1. Open https://yourusername.github.io/poker-spinner/ in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"

## Development

Files:
- `poker-spinner.html` - Main app
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline support
