const selectors = {
  qSlider: document.getElementById("q-slider"),
  qVal: document.getElementById("q-val"),
  tSlider: document.getElementById("t-slider"),
  tVal: document.getElementById("t-val"),
  players: document.getElementById("players"),
  difficulty: document.getElementById("difficulty"),
  categories: document.getElementById("categories"),
  format: document.getElementById("format"),
  speedToggle: document.getElementById("speed-toggle"),
  penaltyToggle: document.getElementById("penalty-toggle"),
  streakToggle: document.getElementById("streak-toggle"),
  sfxToggle: document.getElementById("sfx-toggle"),
  musicToggle: document.getElementById("music-toggle"),
  saveBtn: document.querySelector(".save-btn"),
  backBtns: document.querySelectorAll(".back-btn"),
  startBtn: document.querySelector(".btn-group .btn:nth-child(1)"),
  settingsBtn: document.querySelector(".btn-group .btn:nth-child(2)"),
  scoresBtn: document.querySelector(".btn-group .btn:nth-child(3)"),
  pills: document.querySelectorAll(".pill"),
  catPills: document.querySelectorAll(".cat-pill"),
  toggles: document.querySelectorAll(".toggle"),
};

const scrollTo = (selector) => {
  document.querySelector(selector).scrollIntoView({ behavior: "smooth" });
};

selectors.startBtn.addEventListener("click", () => scrollTo(".game"));
selectors.settingsBtn.addEventListener("click", () => scrollTo(".settings"));
selectors.scoresBtn.addEventListener("click", () => scrollTo(".scores"));
selectors.saveBtn.addEventListener("click", async () => {
  const settings = window.TriviaQuestions.readSettings();
  console.log("Settings saved:", settings);

  scrollTo(".game");

  try {
    selectors.saveBtn.textContent = "Loading...";
    selectors.saveBtn.disabled = true;

    const questions = await window.TriviaQuestions.fetchQuestions(settings);
    console.log(`Fetched ${questions.length} questions:`, questions);

    // Store on window so the game screen can access them
    window.triviaGameData = { questions, settings };

    // TODO: hand off to game screen renderer
  } catch (err) {
    console.error("Failed to load questions:", err);
    alert(`Could not load questions: ${err.message}`);
    scrollTo(".settings");
  } finally {
    selectors.saveBtn.textContent = "Save & Play";
    selectors.saveBtn.disabled = false;
  }
});

selectors.backBtns.forEach((btn) => {
  btn.addEventListener("click", () => scrollTo(".home"));
});
