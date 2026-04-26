// ─────────────────────────────────────────────
//  questions.js — Open Trivia DB integration
// ─────────────────────────────────────────────

const BASE_URL = "https://opentdb.com/api.php";

// ── Session token (prevents duplicate questions) ──────────────────────────────

let sessionToken = null;

async function fetchSessionToken() {
  const res = await fetch("https://opentdb.com/api_token.php?command=request");
  const data = await res.json();
  if (data.response_code === 0) {
    sessionToken = data.token;
    console.log("Session token acquired:", sessionToken);
  }
}

async function resetSessionToken() {
  if (!sessionToken) return;
  await fetch(
    `https://opentdb.com/api_token.php?command=reset&token=${sessionToken}`
  );
  console.log("Session token reset.");
}

// ── Build API URL from current settings ──────────────────────────────────────

function buildApiUrl(settings) {
  const params = new URLSearchParams();

  params.set("amount", settings.amount);

  // Only one category allowed per call — if multiple are selected,
  // we round-robin across calls in fetchQuestions() below
  if (settings.category) {
    params.set("category", settings.category);
  }

  // "any" means omit the difficulty param entirely
  if (settings.difficulty && settings.difficulty !== "any") {
    params.set("difficulty", settings.difficulty);
  }

  // "multiple" or "boolean" — API values used directly
  if (settings.type) {
    params.set("type", settings.type);
  }

  if (sessionToken) {
    params.set("token", sessionToken);
  }

  // Use url3986 encoding to safely handle special characters & unicode
  params.set("encode", "url3986");

  return `${BASE_URL}?${params.toString()}`;
}

// ── Decode url3986-encoded strings returned by the API ───────────────────────

function decodeField(str) {
  return decodeURIComponent(str);
}

function decodeQuestion(q) {
  return {
    category: decodeField(q.category),
    type: decodeField(q.type),
    difficulty: decodeField(q.difficulty),
    question: decodeField(q.question),
    correct_answer: decodeField(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map(decodeField),
  };
}

// ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main fetch — handles multiple categories by splitting calls ───────────────
//
// settings shape:
// {
//   amount:      number,          // total questions wanted (5–50)
//   categories:  number[],        // array of category IDs (empty = any)
//   difficulty:  string,          // "easy" | "medium" | "hard" | "any"
//   type:        string,          // "multiple" | "boolean"
// }

async function fetchQuestions(settings) {
  // Acquire a session token on first run
  if (!sessionToken) {
    await fetchSessionToken();
  }

  const { amount, categories, difficulty, type } = settings;

  let questions = [];

  try {
    if (!categories || categories.length === 0) {
      // No category filter — single call for all questions
      const url = buildApiUrl({ amount, difficulty, type });
      questions = await _fetchFromUrl(url, amount);
    } else if (categories.length === 1) {
      // Single category — one call
      const url = buildApiUrl({
        amount,
        category: categories[0],
        difficulty,
        type,
      });
      questions = await _fetchFromUrl(url, amount);
    } else {
      // Multiple categories — split amount across categories, then shuffle
      const perCat = Math.ceil(amount / categories.length);
      const batches = await Promise.all(
        categories.map((catId) => {
          const url = buildApiUrl({
            amount: perCat,
            category: catId,
            difficulty,
            type,
          });
          return _fetchFromUrl(url, perCat);
        })
      );
      // Flatten, shuffle, then trim to the requested total
      questions = shuffle(batches.flat()).slice(0, amount);
    }
  } catch (err) {
    console.error("fetchQuestions error:", err);
    throw err;
  }

  // Attach shuffled answer options to each question for convenience
  return questions.map((q) => ({
    ...q,
    answers: shuffle([q.correct_answer, ...q.incorrect_answers]),
  }));
}

// ── Internal: fetch a single URL and handle response codes ───────────────────

async function _fetchFromUrl(url, requested) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const data = await res.json();

  switch (data.response_code) {
    case 0:
      return data.results.map(decodeQuestion);

    case 1:
      throw new Error(
        `Not enough questions in the database for this query (requested ${requested}).`
      );

    case 2:
      throw new Error("Invalid API parameters — check category ID, difficulty, or type.");

    case 3:
      // Token missing — refetch and retry once
      console.warn("Session token not found — refetching...");
      await fetchSessionToken();
      return _fetchFromUrl(url.replace(/&token=[^&]+/, `&token=${sessionToken}`), requested);

    case 4:
      // Token exhausted — reset and retry once
      console.warn("All questions exhausted for this token — resetting...");
      await resetSessionToken();
      return _fetchFromUrl(url.replace(/&token=[^&]+/, `&token=${sessionToken}`), requested);

    case 5:
      // Rate limited — wait 5 seconds and retry
      console.warn("Rate limited — retrying in 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
      return _fetchFromUrl(url, requested);

    default:
      throw new Error(`Unknown API response code: ${data.response_code}`);
  }
}

// ── Read active settings from the DOM ────────────────────────────────────────
//
// Call this in app.js when the player clicks Save & Play.
// Returns a settings object ready to pass into fetchQuestions().

function readSettings() {
  const amount = parseInt(document.getElementById("q-slider").value, 10);

  const activeDiff = document.querySelector("#difficulty .pill.active");
  const difficulty = activeDiff ? activeDiff.dataset.val : "any";

  const activeFormat = document.querySelector("#format .pill.active");
  const type = activeFormat ? activeFormat.dataset.val : "multiple";

  const activeCats = document.querySelectorAll("#categories .cat-pill.active");
  const categories = Array.from(activeCats)
    .map((el) => parseInt(el.dataset.id, 10))
    .filter(Boolean);

  const timeLimit = parseInt(document.getElementById("t-slider").value, 10);
  const players = parseInt(
    document.querySelector("#players .pill.active")?.dataset.val ?? "1",
    10
  );

  const speedBonus = document.getElementById("speed-toggle").classList.contains("on");
  const penalty = document.getElementById("penalty-toggle").classList.contains("on");
  const streakBonus = document.getElementById("streak-toggle").classList.contains("on");

  return {
    amount,
    categories,
    difficulty,
    type,
    timeLimit,
    players,
    speedBonus,
    penalty,
    streakBonus,
  };
}

// ── Exports (accessible globally for app.js) ──────────────────────────────────

window.TriviaQuestions = {
  fetchQuestions,
  readSettings,
  resetSessionToken,
};
