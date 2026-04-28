// ─────────────────────────────────────────────────────────────────────
//  app.js — Screen router + game loop state machine
// ─────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════
//  SCREEN ROUTER
// ══════════════════════════════════════════════════════════════════════

const SCREENS = ["home", "settings", "player-setup", "game", "results"];

function showScreen(id) {
  SCREENS.forEach((s) => {
    const el = document.getElementById(`screen-${s}`);
    if (el) el.classList.toggle("active", s === id);
  });
}

// ══════════════════════════════════════════════════════════════════════
//  SETTINGS PERSISTENCE
// ══════════════════════════════════════════════════════════════════════

function saveSettingsToStorage(settings) {
  try { localStorage.setItem("trivia_settings", JSON.stringify(settings)); } catch (_) {}
}

function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem("trivia_settings");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function applySettingsToDOM(settings) {
  if (!settings) return;

  const qs = document.getElementById("q-slider");
  const ts = document.getElementById("t-slider");
  if (settings.amount !== undefined) {
    qs.value = settings.amount;
    document.getElementById("q-val").textContent = settings.amount;
  }
  if (settings.timeLimit !== undefined) {
    ts.value = settings.timeLimit;
    document.getElementById("t-val").textContent =
      settings.timeLimit === 0 ? "Off" : settings.timeLimit + "s";
  }

  const singleGroups = [
    { id: "players",    key: "players" },
    { id: "difficulty", key: "difficulty" },
    { id: "format",     key: "type" },
  ];
  singleGroups.forEach(({ id, key }) => {
    const val = settings[key];
    if (val == null) return;
    document.querySelectorAll(`#${id} .pill`).forEach((p) => {
      p.classList.toggle("active", p.dataset.val === String(val));
    });
  });

  if (settings.categories) {
    const cats = settings.categories.map(String);
    document.querySelectorAll("#categories .cat-pill").forEach((p) => {
      p.classList.toggle("active", cats.includes(p.dataset.id));
    });
  }

  const toggleMap = {
    "speed-toggle":        "speedBonus",
    "penalty-toggle":      "penalty",
    "streak-toggle":       "streakBonus",
    "show-choices-toggle": "showChoices",
    "sfx-toggle":          "sfx",
    "music-toggle":        "music",
  };
  Object.entries(toggleMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && settings[key] !== undefined) {
      el.classList.toggle("on", !!settings[key]);
    }
  });
}

// ══════════════════════════════════════════════════════════════════════
//  SETTINGS PAGE INTERACTIVITY
// ══════════════════════════════════════════════════════════════════════

function initSettingsInteractivity() {
  const qSlider = document.getElementById("q-slider");
  const qVal    = document.getElementById("q-val");
  qSlider.addEventListener("input", () => { qVal.textContent = qSlider.value; });

  const tSlider = document.getElementById("t-slider");
  const tVal    = document.getElementById("t-val");
  tSlider.addEventListener("input", () => {
    tVal.textContent = tSlider.value === "0" ? "Off" : tSlider.value + "s";
  });

  ["players", "difficulty", "format"].forEach((groupId) => {
    const group = document.getElementById(groupId);
    group.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      group.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

  document.getElementById("categories").addEventListener("click", (e) => {
    const pill = e.target.closest(".cat-pill");
    if (!pill) return;
    pill.classList.toggle("active");
  });

  document.querySelectorAll(".toggle").forEach((t) => {
    t.addEventListener("click", () => t.classList.toggle("on"));
  });
}

function getShowChoicesSetting() {
  return document.getElementById("show-choices-toggle").classList.contains("on");
}

// ══════════════════════════════════════════════════════════════════════
//  PLAYER STORAGE
// ══════════════════════════════════════════════════════════════════════

function loadStoredPlayers() {
  try {
    const raw = localStorage.getItem("trivia_players");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function savePlayersToStorage(players) {
  try { localStorage.setItem("trivia_players", JSON.stringify(players)); } catch (_) {}
}

function exportPlayersJSON(players) {
  const payload = {
    exported: new Date().toISOString(),
    source:   "Trivia Night",
    players,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `trivia-night-scores-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════
//  RESULTS CARD RENDERING  (shared)
// ══════════════════════════════════════════════════════════════════════

const RANK_LABELS = ["first", "second", "third", "fourth"];
const RANK_NAMES  = ["1st",   "2nd",    "3rd",    "4th"];

function renderResultsCards(players) {
  const grid = document.getElementById("cards-grid");
  grid.innerHTML = "";

  if (!players || players.length === 0) {
    grid.innerHTML =
      '<p style="color:#555;font-size:0.85rem;text-align:center;padding:2rem;grid-column:1/-1">No scores yet — play a round first!</p>';
    return;
  }

  players.forEach((p, i) => {
    const cls  = RANK_LABELS[i] || "";
    const rank = RANK_NAMES[i]  || `${i + 1}th`;
    const card = document.createElement("div");
    card.className = `player-card ${cls}`;
    card.innerHTML = `
      ${i === 0 ? '<div class="crown">👑</div>' : ""}
      <div class="rank-badge">${rank}</div>
      <div class="avatar">${p.name.charAt(0).toUpperCase()}</div>
      <div class="player-name">${p.name}</div>
      <div class="score-val">${Number(p.score).toLocaleString()}</div>
      <div class="score-label">points</div>
      <div class="stats">
        <div class="stat-row"><span>Correct</span><span>${p.accuracy}</span></div>
        <div class="stat-row"><span>Avg time</span><span>${p.avgTime > 0 ? p.avgTime + "s" : "—"}</span></div>
        <div class="stat-row"><span>Best streak</span><span>\xD7${p.streak}</span></div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════════════════════
//  PLAYER SETUP SCREEN
// ══════════════════════════════════════════════════════════════════════

function renderPlayerSetup(playerCount) {
  const container = document.getElementById("name-inputs");
  const startBtn  = document.getElementById("start-game-btn");
  const banner    = document.getElementById("returning-banner");
  container.innerHTML = "";
  startBtn.disabled = true;

  const stored = loadStoredPlayers();
  // Only offer returning names if count matches and names exist
  const hasReturning = stored && stored.length >= playerCount &&
    stored.slice(0, playerCount).every((p) => p.name);

  // Build blank inputs first
  function buildInputs(prefillNames) {
    container.innerHTML = "";
    for (let i = 0; i < playerCount; i++) {
      const val = prefillNames && prefillNames[i] ? prefillNames[i] : "";
      const row = document.createElement("div");
      row.className = "name-row";
      row.innerHTML = `
        <label for="pname-${i}">Player ${i + 1}</label>
        <input class="name-input" id="pname-${i}" type="text"
          placeholder="Enter name\u2026" maxlength="20" autocomplete="off"
          value="${val.replace(/"/g, "&quot;")}" />
      `;
      container.appendChild(row);
    }
    checkNames();
  }

  const checkNames = () => {
    const allFilled = [...container.querySelectorAll(".name-input")]
      .every((inp) => inp.value.trim().length > 0);
    startBtn.disabled = !allFilled;
  };
  container.addEventListener("input", checkNames);

  if (hasReturning) {
    // Show banner with returning names
    banner.classList.remove("hidden");
    document.getElementById("returning-names").textContent =
      stored.slice(0, playerCount).map((p) => p.name).join(", ");

    // Start with blank inputs while banner is showing
    buildInputs(null);

    document.getElementById("prefill-yes-btn").onclick = () => {
      banner.classList.add("hidden");
      buildInputs(stored.slice(0, playerCount).map((p) => p.name));
    };
    document.getElementById("prefill-no-btn").onclick = () => {
      banner.classList.add("hidden");
      buildInputs(null);
    };
  } else {
    banner.classList.add("hidden");
    buildInputs(null);
  }
}

function getPlayerNames() {
  return [...document.querySelectorAll(".name-input")].map((inp) => inp.value.trim());
}

// ══════════════════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════════════════

let session = null;

function renderQuestion() {
  const q     = session.currentQuestion;
  if (!q) return;

  const total = session.questions.length;
  const idx   = session.qIndex + 1;

  document.getElementById("q-counter").textContent =
    `${String(idx).padStart(2, "0")} / ${total}`;
  document.getElementById("q-cat").textContent = q.category;

  const diffEl = document.getElementById("q-diff");
  diffEl.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
  diffEl.className   = `q-diff ${q.difficulty}`;

  document.getElementById("question-text").textContent = q.question;

  // Choices — respect showChoices setting
  const grid        = document.getElementById("choices-grid");
  const showChoices = session.settings.showChoices !== false;
  grid.innerHTML    = "";
  grid.style.display = showChoices ? "" : "none";

  if (showChoices) {
    const keys = ["A", "B", "C", "D"];
    q.answers.forEach((ans, i) => {
      const btn = document.createElement("button");
      btn.className   = "choice-btn";
      btn.dataset.idx = i;
      btn.innerHTML   = `<span class="choice-key">${keys[i] || "?"}</span><span class="choice-text">${ans}</span>`;
      grid.appendChild(btn);
    });
  }

  updateStreakBar();

  // Timer
  const ring  = document.getElementById("timer-ring");
  const numEl = document.getElementById("timer-num");
  const fill  = document.getElementById("ring-fill");
  const CIRC  = 175.9;

  if (session.settings.timeLimit > 0) {
    ring.classList.remove("hidden-ring", "danger");
    session.timeRemaining = session.settings.timeLimit;
    numEl.textContent = session.settings.timeLimit;
    fill.style.strokeDashoffset = "0";

    session.startTimer(
      (t) => {
        numEl.textContent = t;
        fill.style.strokeDashoffset =
          String(CIRC * (1 - t / session.settings.timeLimit));
        if (t <= 5) ring.classList.add("danger");
      },
      () => { ring.classList.add("danger"); revealAnswer(); }
    );
  } else {
    ring.classList.add("hidden-ring");
  }

  renderHudScores();

  document.getElementById("sub-question").classList.remove("hidden");
  document.getElementById("sub-answer").classList.add("hidden");
  document.getElementById("next-btn").classList.add("hidden");
}

function updateStreakBar() {
  const bar = document.getElementById("streak-bar");
  if (!session.settings.streakBonus) { bar.style.display = "none"; return; }
  bar.style.display = "";
  const maxStreak = Math.max(...session.players.map((p) => p.streak));
  document.querySelectorAll("#streak-pips .pip").forEach((pip, i) =>
    pip.classList.toggle("active", i < maxStreak));
  const mult = maxStreak >= 5 ? "\xD72" : maxStreak >= 3 ? "\xD71.5" : "\xD71";
  document.getElementById("streak-mult").textContent = mult;
}

function renderHudScores() {
  const container = document.getElementById("hud-scores");
  container.innerHTML = "";
  if (session.players.length === 1) {
    const p   = session.players[0];
    const lbl = document.createElement("div");
    lbl.className   = "hud-label";
    lbl.textContent = "Score";
    const val = document.createElement("div");
    val.className   = "hud-val";
    val.textContent = p.score.toLocaleString();
    container.append(lbl, val);
    return;
  }
  session.players.forEach((p) => {
    const row = document.createElement("div");
    row.className = "hud-score-row";
    row.innerHTML = `<span class="hud-sname">${p.name}</span><span class="hud-sval">${p.score.toLocaleString()}</span>`;
    container.appendChild(row);
  });
}

function revealAnswer() {
  session.stopTimer();

  const q = session.currentQuestion;

  document.querySelectorAll(".choice-btn").forEach((btn) => {
    const text = btn.querySelector(".choice-text").textContent;
    btn.classList.add(text === q.correct_answer ? "correct" : "incorrect");
    btn.disabled = true;
  });

  document.getElementById("correct-answer-text").textContent = q.correct_answer;

  document.getElementById("sub-question").classList.add("hidden");
  document.getElementById("sub-answer").classList.remove("hidden");
  document.getElementById("next-btn").classList.add("hidden");

  renderPlayerSelectCards();
}

function renderPlayerSelectCards() {
  const grid = document.getElementById("player-select-grid");
  grid.innerHTML = "";

  session.players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "ps-card";
    card.innerHTML = `
      <div class="ps-avatar">${player.name.charAt(0).toUpperCase()}</div>
      <div class="ps-name">${player.name}</div>
      <div class="ps-score">${player.score.toLocaleString()}</div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("correct-pick");
      updatePointsPreview();
      document.getElementById("next-btn").classList.remove("hidden");
    });

    grid.appendChild(card);
  });
}

function updatePointsPreview() {
  const correctCount = document.querySelectorAll(".ps-card.correct-pick").length;
  if (correctCount === 0) {
    document.getElementById("points-preview").textContent = "";
    return;
  }
  let pts = 100;
  if (session.settings.speedBonus && session.settings.timeLimit > 0) {
    const rem = Math.max(0, session.timeRemaining || 0);
    pts += Math.floor((rem / session.settings.timeLimit) * 50);
  }
  document.getElementById("points-preview").textContent = `+${pts} pts each`;
}

function advanceGame(correctPlayers, wrongPlayers) {
  const timeUsed = session.settings.timeLimit
    ? session.settings.timeLimit - (session.timeRemaining || 0)
    : 0;

  session.awardPoints({ correctPlayers, wrongPlayers, timeUsed });
  session.save();

  if (session.isLastQuestion) {
    showResults();
  } else {
    session.advance();
    renderQuestion();
    showScreen("game");
  }
}

// ══════════════════════════════════════════════════════════════════════
//  RESULTS SCREEN
// ══════════════════════════════════════════════════════════════════════

function showResults() {
  GameSession.clear();

  const sorted = [...session.players]
    .sort((a, b) => b.score - a.score)
    .map((p) => p.getSummary());

  savePlayersToStorage(sorted);
  renderResultsCards(sorted);

  document.getElementById("results-sub").textContent =
    `Round complete \xB7 ${session.questions.length} question${session.questions.length !== 1 ? "s" : ""}`;

  showScreen("results");
}

// ══════════════════════════════════════════════════════════════════════
//  WIRE-UP
// ══════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const saved = loadSettingsFromStorage();
  if (saved) applySettingsToDOM(saved);

  initSettingsInteractivity();

  // Home
  document.getElementById("home-play-btn").addEventListener("click",     () => showScreen("settings"));
  document.getElementById("home-settings-btn").addEventListener("click", () => showScreen("settings"));
  document.getElementById("home-scores-btn").addEventListener("click",   () => {
    const stored = loadStoredPlayers();
    renderResultsCards(stored);
    document.getElementById("results-sub").textContent =
      stored && stored.length > 0 ? "Last session scores" : "No scores yet";
    showScreen("results");
  });

  // Back buttons
  document.querySelectorAll(".back-btn[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.target));
  });

  // Settings → Player Setup
  document.getElementById("save-btn").addEventListener("click", () => {
    const settings = window.TriviaQuestions.readSettings();
    settings.showChoices = getShowChoicesSetting();
    saveSettingsToStorage(settings);
    renderPlayerSetup(settings.players || 1);
    showScreen("player-setup");
  });

  // Player Setup → Game
  document.getElementById("start-game-btn").addEventListener("click", async () => {
    const settings = loadSettingsFromStorage() || window.TriviaQuestions.readSettings();
    const names    = getPlayerNames();
    const startBtn = document.getElementById("start-game-btn");

    startBtn.textContent = "Loading\u2026";
    startBtn.disabled    = true;

    try {
      const questions = await window.TriviaQuestions.fetchQuestions(settings);
      const players   = names.map((n) => new Player(n));
      session = new GameSession(questions, settings, players);
      session.save();
      showScreen("game");
      renderQuestion();
    } catch (err) {
      alert(`Could not load questions: ${err.message}`);
    } finally {
      startBtn.textContent = "Start Game \u2192";
      startBtn.disabled    = false;
    }
  });

  // Reveal Answer
  document.getElementById("reveal-btn").addEventListener("click", () => {
    if (!session) return;
    revealAnswer();
  });

  // Nobody
  document.getElementById("nobody-btn").addEventListener("click", () => {
    if (!session) return;
    document.querySelectorAll(".ps-card").forEach((c) =>
      c.classList.remove("correct-pick", "wrong-pick"));
    document.getElementById("points-preview").textContent = "Nobody scores \u2014 streaks reset";
    document.getElementById("next-btn").classList.remove("hidden");
  });

  // Next Question
  document.getElementById("next-btn").addEventListener("click", () => {
    if (!session) return;

    const correctPlayers = [];
    const wrongPlayers   = [];

    document.querySelectorAll(".ps-card").forEach((card, i) => {
      const player = session.players[i];
      if (card.classList.contains("correct-pick"))   correctPlayers.push(player);
      else if (card.classList.contains("wrong-pick")) wrongPlayers.push(player);
    });

    advanceGame(correctPlayers, wrongPlayers);
  });

  // Replay
  document.getElementById("replay-btn").addEventListener("click", () => {
    const s = loadSettingsFromStorage();
    if (s) applySettingsToDOM(s);
    showScreen("settings");
  });

  // Results → Home
  document.getElementById("results-home-btn").addEventListener("click", () => showScreen("home"));

  // Export JSON
  document.getElementById("export-btn").addEventListener("click", () => {
    const stored = loadStoredPlayers();
    if (!stored || stored.length === 0) {
      alert("No player data to export yet.");
      return;
    }
    exportPlayersJSON(stored);
  });

  // Reset Scores (keep names)
  document.getElementById("reset-scores-btn").addEventListener("click", () => {
    const stored = loadStoredPlayers();
    if (!stored || stored.length === 0) {
      alert("No player data to reset.");
      return;
    }
    if (!confirm("Reset all scores to 0? Player names will be kept.")) return;

    const reset = stored.map((p) => ({
      ...p,
      score:    0,
      accuracy: "0 / 0",
      avgTime:  0,
      streak:   0,
    }));
    savePlayersToStorage(reset);

    if (session) session.players.forEach((p) => p.reset());

    renderResultsCards(reset);
    document.getElementById("results-sub").textContent = "Scores reset \u2014 names kept";
  });

  // Full Wipe
  document.getElementById("wipe-btn").addEventListener("click", () => {
    if (!confirm("Full wipe: delete all player names, scores, and session history?")) return;

    localStorage.removeItem("trivia_players");
    GameSession.clear();
    session = null;

    renderResultsCards(null);
    document.getElementById("results-sub").textContent = "All data wiped";
  });

  showScreen("home");
});
