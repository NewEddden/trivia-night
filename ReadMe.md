# 🎉 Trivia Night

A browser-based, multi-player trivia game with a polished dark UI, animated title screen, full settings configuration, and a post-game scoreboard. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

![Music Player Preview](my-main-screen.png)

## 📁 Project Structure

```
trivia-night/
├── index.html              # All four screens (Home, Game, Settings, Scores)
├── api.txt                 # API notes / endpoint reference
├── ReadMe.md               # Project documentation
├── css/
│   └── styles.css          # All styling — layout, animations, components
├── data/
│   └── categories.js       # Category data and filtering logic
├── Images (Inspiration)/
│   └── image.png           # UI inspiration / reference image
└── js/
    ├── app.js              # Navigation logic, DOM selectors, event listeners
    ├── questions.js        # (planned) Question bank and question loading
    └── scoring.js          # (planned) Score calculation and streak logic
```

---

## 🖥️ Screens

The app is structured as a single HTML page with four full-viewport `<section>` elements. Navigation is handled by smooth-scrolling between sections — no page reloads or routing.

### 1. Home Screen (`.home`)

- Displays the animated **"Trivia Night"** logo
- Three buttons: **Start Game**, **Settings**, **Scores**
- Each button scrolls to the corresponding section

### 2. Game Screen (`.game`)

- Currently an empty placeholder (`<section class="game game-Page">`)
- Intended for question display, answer options, timer, and live scoring

### 3. Settings Screen (`.settings`)

- Full configuration panel with the following options:

| Setting              | Type              | Options                                                                                       |
| -------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Questions            | Range slider      | 5 – 50 (step 5, default 20)                                                                   |
| Time per question    | Range slider      | 0 – 60s (step 5, default 30s; 0 = no limit)                                                   |
| Players              | Pill selector     | 1, 2, 3, 4                                                                                    |
| Difficulty           | Multi-pill toggle | Easy, Medium, Hard, Mixed                                                                     |
| Categories           | Grid toggle       | History, Science, Sports, Pop Culture, Geography, Movies, Music, Technology, Food, Literature |
| Speed bonus          | Toggle            | On / Off (default On)                                                                         |
| Wrong answer penalty | Toggle            | On / Off (default Off)                                                                        |
| Streak bonus         | Toggle            | On / Off (default On)                                                                         |
| Answer format        | Pill selector     | Multiple choice, True/False, Type in                                                          |
| Sound effects        | Toggle            | On / Off (default On)                                                                         |
| Music                | Toggle            | On / Off (default On)                                                                         |

- **Save & Play** button scrolls to the game screen
- **← Back** button returns to the home screen

### 4. Scores Screen (`.scores`)

- Displays a post-game leaderboard with up to 4 player cards
- Each card shows: rank badge, avatar initial, player name, total points, correct answers, average response time, and best streak
- 1st place highlighted in gold, 2nd in silver, 3rd in bronze
- **← Back** button returns to the home screen

---

## 🎨 Design & Styling

**Color palette:**

| Color           | Hex             | Used for                                             |
| --------------- | --------------- | ---------------------------------------------------- |
| Green           | `#4a7c2f`       | Title letters (T, N, t), toggle ON state             |
| Orange          | `#e8940a`       | Title letters (r, a, h), accents, 1st place, sliders |
| Red             | `#cc1f1f`       | Title letters (i, i)                                 |
| Blue            | `#1a5fa8`       | Title letters (v, g)                                 |
| White           | `#ffffff`       | Title letter (i)                                     |
| Dark background | `#111` / `#000` | Page background, cards                               |

**Typography:** Georgia / Times New Roman serif for all UI elements.

**Animations:**

- Each letter in the "Trivia Night" title has a unique `clip-path` polygon that morphs continuously via per-letter `@keyframes` (`wobble-1`, `wobble-2`, `morph`). Animation durations are staggered (3.5s – 4.4s) with negative delays to desynchronize them for an organic, lively effect.
- Buttons feature a rainbow animated glow border using a `background-size: 400%` gradient cycling via `@keyframes glowing-btn`.

---

## ⚙️ JavaScript — `app.js`

Currently handles all navigation and UI interaction setup.

**DOM selectors** are cached in a single `selectors` object at the top of the file for maintainability.

**Navigation:**

```js
selectors.startBtn   → scrolls to .game
selectors.settingsBtn → scrolls to .settings
selectors.scoresBtn  → scrolls to .scores
selectors.saveBtn    → scrolls to .game
selectors.backBtns   → all scroll to .home
```

All navigation uses `scrollIntoView({ behavior: "smooth" })` via a shared `scrollTo(selector)` helper.

---

## 🚧 What's Not Built Yet

The following files are scaffolded but currently empty:

- **`categories.js`** — Category definitions, enabling/disabling logic tied to settings
- **`questions.js`** — Question bank (or API integration), question selection based on category/difficulty/format settings
- **`scoring.js`** — Point calculation including speed bonus, penalty logic, and streak multiplier

The game screen itself (`.game`) is also a blank placeholder — the core gameplay loop (displaying questions, handling answers, running the timer, tracking scores per player) still needs to be built.

**Settings are UI-only** — the sliders, toggles, and pills work visually but their values are not yet read, validated, or passed anywhere when "Save & Play" is clicked.

---t=50

## 🚀 Running the Project

No build step or server required for the static assets, but because `app.js` and `styles.css` are loaded via absolute paths (`/js/app.js`, `/css/styles.css`), you'll need a local server rather than opening `index.html` directly from the filesystem.

```bash
# Option 1 — Python
python3 -m http.server 8080

# Option 2 — Node (npx)
npx serve .

# Option 3 — VS Code
# Use the Live Server extension and open index.html
```

Then visit `http://localhost:8080` in your browser.

---

## 🗺️ Planned Features

- [ ] Wire settings values to game state object
- [ ] Build question engine (`questions.js`) — local bank or Open Trivia DB API
- [ ] Implement scoring system (`scoring.js`) — base points, speed bonus, streak multiplier, penalty
- [ ] Build the game screen — question card, answer buttons/input, countdown timer, progress bar
- [ ] Add category filtering (`categories.js`)
- [ ] Player name entry before game starts
- [ ] Sound effects and background music (`audio/`)
- [ ] Persist high scores to `localStorage`
- [ ] Mobile/responsive polish
