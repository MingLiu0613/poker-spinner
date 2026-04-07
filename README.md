# Poker Tools

A small Texas Hold'em PWA with two tools: a decision spinner and a win-rate calculator. Built as a static site that works well on mobile, including iPhone home screen installs.

## Features

- Decision spinner with a 0-100% call slider
- Win-rate calculator for preflop, flop, turn, and river spots
- Hero and multi-villain hand selection
- Automatic recalculation when cards or street change
- Works offline after first load
- Add to iPhone home screen for app-like experience

## How to Use

### Decision Spinner
1. Set your call probability
2. Click `SPIN`
3. The wheel lands on a number 0-99

### Win Rate Calculator
1. Choose the street: preflop, flop, turn, or river
2. Set the hero hand
3. Set the visible board cards for that street
4. Add one or more villains and choose their hands
5. Read the automatic win-rate output for every player

## Installation

### iPhone
1. Open the deployed site in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"

## Development

Files:
- `poker-spinner.html` - Decision spinner
- `holdem-equity.html` - Win-rate calculator
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline support
