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
selectors.saveBtn.addEventListener("click", () => scrollTo(".game"));

selectors.backBtns.forEach((btn) => {
  btn.addEventListener("click", () => scrollTo(".home"));
});
