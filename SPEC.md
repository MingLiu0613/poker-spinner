# Texas Hold'em Fortune Spinner - Specification

## Project Overview
- **Project name**: Poker Decision Spinner
- **Type**: Single-page web tool
- **Core functionality**: A fortune spinner that helps poker players make decisions based on input probability percentages
- **Target users**: Texas Hold'em poker players facing difficult decisions

## UI/UX Specification

### Layout Structure
- **Container**: Centered card, max-width 480px
- **Sections**:
  1. Header with title
  2. Input section (percentage slider + number input)
  3. Visual wheel preview showing call/fold ratio
  4. Spin button
  5. Result display area

### Visual Design
- **Color palette**:
  - Background: `#0d1117` (dark)
  - Card background: `#161b22`
  - Call color: `#238636` (green)
  - Fold color: `#da3633` (red)
  - Accent: `#58a6ff` (blue)
  - Text primary: `#e6edf3`
  - Text secondary: `#8b949e`

- **Typography**:
  - Font: `"Outfit", sans-serif` (Google Fonts)
  - Title: 28px, bold
  - Labels: 16px, medium
  - Result: 24px, bold

- **Spacing**: 24px padding, 16px gaps between elements

- **Visual effects**:
  - Subtle card shadow: `0 8px 32px rgba(0,0,0,0.4)`
  - Wheel has gradient shine effect
  - Result text has glow effect matching the outcome color

### Components

1. **Percentage Input**
   - Range slider (0-100, step 1)
   - Number input field (synced with slider)
   - Live display of call % and fold %

2. **Wheel Display**
   - Circular wheel showing call/fold proportions
   - Green segment for call, red segment for fold
   - Center shows current split percentages
   - Pointer indicator at top

3. **Spin Button**
   - Large, prominent button
   - Disabled during spin animation
   - Pulsing glow effect

4. **Result Display**
   - Shows after spin completes
   - Large text: "CALL!" (green) or "FOLD!" (red)
   - Shows the winning number (0-99)
   - Smooth fade-in animation

### Animations
- **Wheel spin**: 4 seconds duration, ease-out timing
- **Wheel rotation**: Multiple full rotations (5-8) + final position
- **Result reveal**: 0.5s fade-in with scale effect
- **Button hover**: Subtle scale and glow

## Functionality Specification

### Core Features
1. **Percentage Input**
   - User enters call percentage (1-100)
   - Fold = 100 - call percentage
   - Minimum 1% for each option (or user can set 100/0)

2. **Wheel Generation**
   - Dynamically generated based on input percentage
   - Green slice = call%, Red slice = fold%

3. **Random Selection**
   - Uses `Math.random()` for fair randomness
   - Range: 0-99 (100 outcomes)
   - Logic: if random < call%, then CALL; else FOLD

4. **Spin Animation**
   - Duration: 4 seconds
   - Calculate final rotation based on random result
   - Smooth deceleration (ease-out)

### User Interactions
1. Adjust percentage via slider or input
2. Click "SPIN" to start
3. Watch wheel spin
4. See result revealed

### Edge Cases
- 100% call → always call (wheel shows all green)
- 0% call → always fold (wheel shows all red)
- Input validation: only allow 0-100, integers

## Acceptance Criteria
- [ ] Percentage can be set from 0-100 in 1% increments
- [ ] Wheel visually represents the call/fold ratio
- [ ] Spin takes 4 seconds with smooth animation
- [ ] Result is mathematically fair (0-99 range)
- [ ] Result matches the logic: 0-(call%-1) = call, call%-99 = fold
- [ ] UI is responsive and looks good on mobile
- [ ] No external dependencies except Google Fonts
