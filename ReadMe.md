# 🎉 Trivia Night

A browser-based, multi-player trivia game with a polished dark UI, animated title screen, full settings configuration, and a post-game scoreboard. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

![Trivia Night Preview](<Images%20(Inspiration)/preview.png>)

---

## 📁 Project Structure

```
trivia-night/
├── index.html                  # All five screens (Home, Settings, Player Setup, Game, Results)
├── api.txt                     # Open Trivia DB endpoint reference
├── ReadMe.md                   # Project documentation
├── css/
│   └── styles.css              # All styling — layout, animations, components
├── data/
│   └── categories.js           # Placeholder — currently empty
├── Images (Inspiration)/
│   └── preview.png             # UI preview image used in this README
└── js/
    ├── app.js                  # Core game loop, navigation, DOM, event listeners
    ├── questions.js            # Open Trivia DB API integration + settings reader
    └── scoring.js              # Player class + GameSession class
```

---

## 🖥️ Screens

The app is a single HTML page with five full-viewport `<section>` elements. Navigation is handled entirely in JavaScript — no page reloads.

### 1. Home Screen

- Animated **"Trivia Night"** logo with per-letter morphing animations
- Three buttons: **Play**, **Settings**, **Scores**

### 2. Settings Screen

- Full configuration panel (see Settings table below)
- **Save & Play** advances to Player Setup
- **← Back** returns to Home

### 3. Player Setup Screen

- Renders name input fields based on the selected player count
- Detects returning players from `localStorage` and offers to prefill their names
- **Start Game →** button enabled only when all names are filled in

### 4. Game Screen

Two sub-views toggled during play:

**Question view** — shows the HUD (question counter, timer ring, mini scores), category/difficulty badge, question text, answer choices grid, streak bar, and a Reveal Answer button.

**Answer reveal view** — shows correct/incorrect banner, the correct answer callout, a player tap grid ("Who got it right?"), a Nobody button, a points preview, and a Next Question button.

### 5. Results Screen

- Ranked player cards (gold / silver / bronze for top 3)
- Each card shows: rank, name initial, total score, accuracy, average response time, and best streak
- Actions: **Replay**, **Export JSON**, **Reset Scores**, **Full Wipe**, **← Home**

---

## ⚙️ Settings

| Setting              | Type          | Options / Range                                                                                          | Default                                     |
| -------------------- | ------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Questions            | Range slider  | 5 – 50 (step 5)                                                                                          | 20                                          |
| Time per question    | Range slider  | 0 – 60s (step 5); 0 = no limit                                                                           | 30s                                         |
| Players              | Pill selector | 1, 2, 3, 4                                                                                               | 1                                           |
| Difficulty           | Pill toggle   | Easy, Medium, Hard, Any                                                                                  | Easy                                        |
| Categories           | Grid toggle   | General Knowledge, History, Science, Sports, Geography, Movies, Music, Technology, Mythology, Literature | General Knowledge, History, Science, Sports |
| Answer format        | Pill selector | Multiple choice, True / False                                                                            | Multiple choice                             |
| Speed bonus          | Toggle        | On / Off                                                                                                 | On                                          |
| Wrong answer penalty | Toggle        | On / Off                                                                                                 | Off                                         |
| Streak bonus         | Toggle        | On / Off                                                                                                 | On                                          |
| Show answer choices  | Toggle        | On / Off                                                                                                 | On                                          |
| Sound effects        | Toggle        | On / Off                                                                                                 | On ⚠️                                       |
| Music                | Toggle        | On / Off                                                                                                 | On ⚠️                                       |

> ⚠️ **Sound effects and Music toggles are UI-only** — no audio files or Web Audio implementation exists yet.

---

## 🧠 JavaScript Modules

### `questions.js` — Open Trivia DB Integration

Handles all communication with the [Open Trivia DB API](https://opentdb.com/).

- Acquires and manages a **session token** to prevent duplicate questions across a session
- Builds the API URL from current settings (amount, category, difficulty, type)
- Splits requests across multiple categories when more than one is selected, then shuffles and trims to the target count
- Decodes `url3986`-encoded API responses
- Handles all API response codes including rate limiting (code 5), token expiry (code 4), and invalid params (code 2)
- Attaches a shuffled `answers` array to each question for easy rendering
- Exposes `readSettings()` — reads all active settings values from the DOM and returns a settings object

**Global export:** `window.TriviaQuestions` (`fetchQuestions`, `readSettings`, `resetSessionToken`)

---

### `scoring.js` — Player & GameSession

#### `Player` class

Tracks per-player state throughout a game:

| Property / Method         | Description                                |
| ------------------------- | ------------------------------------------ |
| `name`                    | Player display name (validated, trimmed)   |
| `score`                   | Current score (floored at 0)               |
| `addPoints(pts)`          | Adds or subtracts points                   |
| `recordTime(seconds)`     | Logs response time for averaging           |
| `timeAvg`                 | Computed average response time             |
| `incrementStreak()`       | Increments streak and updates best streak  |
| `resetStreak()`           | Resets current streak to 0                 |
| `recordAnswer(isCorrect)` | Tracks correct/total answer count          |
| `accuracy`                | Returns `"correct / total"` string         |
| `getSummary()`            | Returns a plain object for results display |
| `reset()`                 | Resets all stats (used for Replay)         |

#### `GameSession` class

Owns the active game state:

| Property / Method                                       | Description                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `currentQuestion`                                       | The active question object                                                                                                 |
| `isLastQuestion`                                        | Boolean — true on the final question                                                                                       |
| `advance()`                                             | Increments question index                                                                                                  |
| `awardPoints({correctPlayers, wrongPlayers, timeUsed})` | Applies base points (100), speed bonus (up to +50), streak multiplier (×1.5 at 3, ×2 at 5), and wrong-answer penalty (−50) |
| `startTimer(onTick, onExpire)`                          | ⚠️ Defined but not yet called in `app.js`                                                                                  |
| `stopTimer()`                                           | Clears the timer interval                                                                                                  |
| `save()`                                                | Persists session snapshot to `localStorage`                                                                                |
| `GameSession.load()`                                    | Restores a saved session snapshot                                                                                          |
| `GameSession.clear()`                                   | Removes saved session from `localStorage`                                                                                  |

**Global exports:** `window.Player`, `window.GameSession`

---

### `categories.js`

Currently an **empty placeholder**. Intended for category definitions and filtering logic tied to settings.

---

## 🎨 Design & Styling

**Color palette:**

| Color           | Hex             | Used for                                          |
| --------------- | --------------- | ------------------------------------------------- |
| Green           | `#4a7c2f`       | Title letters (T, N, t), toggle ON state          |
| Orange          | `#e8940a`       | Title letters (r, a, h), sliders, 1st place badge |
| Red             | `#cc1f1f`       | Title letters (i, i), Hard pill                   |
| Blue            | `#1a5fa8`       | Title letters (v, g), Multiple choice pill        |
| White           | `#ffffff`       | Title letter (i dot)                              |
| Dark background | `#111` / `#000` | Page background, cards                            |

**Typography:** Georgia / Times New Roman serif throughout.

**Animations:**

- Each letter in "Trivia Night" has a unique `clip-path` polygon morphing continuously via per-letter `@keyframes` (`wobble-1`, `wobble-2`, `morph`), staggered from 3.5s–4.4s with negative delays for an organic effect.
- Buttons have a rainbow animated glow border via a `background-size: 400%` gradient cycling with `@keyframes glowing-btn`.

---

## 🚀 Running the Project

Scripts are loaded via absolute paths (`/js/app.js`, `/css/styles.css`), so a local server is required — opening `index.html` directly from the filesystem won't work.

```bash
# Option 1 — Python
python3 -m http.server 8080

# Option 2 — Node
npx serve .

# Option 3 — VS Code
# Use the Live Server extension
```

Then visit `http://localhost:8080`.

---

## 🚧 What Isn't Built Yet

| Feature             | Status                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Timer**           | `GameSession.startTimer()` is fully implemented in `scoring.js` but is never called from `app.js` — the timer ring in the HUD is visual-only |
| **Sound effects**   | Toggle exists in settings UI; no audio files or Web Audio code                                                                               |
| **Music**           | Toggle exists in settings UI; no audio files or Web Audio code                                                                               |
| **`categories.js`** | File exists but is completely empty                                                                                                          |
| **Session resume**  | `GameSession.save()` and `.load()` are implemented but not yet wired into the app flow                                                       |

---

## 🗺️ Planned Features

- [ ] Wire `startTimer()` into the game loop in `app.js`
- [ ] Add audio files and implement sound effects / background music
- [ ] Build out `categories.js` with category metadata and filtering logic
- [ ] Hook `GameSession.save()` / `.load()` into the app for mid-game resume
- [ ] Mobile / responsive polish
