// ─────────────────────────────────────────────
//  scoring.js — Player class + GameSession
// ─────────────────────────────────────────────

class Player {
  constructor(name, score = 0, timeAvg = [], streak = 0) {
    this._name = name;
    this._score = score;
    this._timeAvg = timeAvg;
    this._streak = streak;
    this._correct = 0;
    this._total = 0;
    this._bestStreak = 0;
  }

  // ─── Name ───────────────────────────────────
  get name() { return this._name; }
  set name(val) {
    if (typeof val !== "string" || val.trim() === "") throw new Error("Name must be a non-empty string.");
    this._name = val.trim();
  }

  // ─── Score ──────────────────────────────────
  get score() { return this._score; }
  set score(val) {
    if (typeof val !== "number") throw new Error("Score must be a number.");
    this._score = val;
  }
  addPoints(pts) {
    this._score += pts;
    if (this._score < 0) this._score = 0;
  }

  // ─── Time ───────────────────────────────────
  get timeAvg() {
    if (this._timeAvg.length === 0) return 0;
    const sum = this._timeAvg.reduce((a, b) => a + b, 0);
    return parseFloat((sum / this._timeAvg.length).toFixed(1));
  }
  recordTime(seconds) {
    if (typeof seconds === "number" && seconds >= 0) this._timeAvg.push(seconds);
  }

  // ─── Streak ─────────────────────────────────
  get streak() { return this._streak; }
  get bestStreak() { return this._bestStreak; }
  incrementStreak() {
    this._streak++;
    if (this._streak > this._bestStreak) this._bestStreak = this._streak;
  }
  resetStreak() { this._streak = 0; }

  // ─── Answer tracking ────────────────────────
  get correct() { return this._correct; }
  get total()   { return this._total; }
  get accuracy() {
    if (this._total === 0) return "0 / 0";
    return `${this._correct} / ${this._total}`;
  }
  recordAnswer(isCorrect) {
    this._total++;
    if (isCorrect) this._correct++;
  }

  // ─── Summary ────────────────────────────────
  getSummary() {
    return {
      name: this._name,
      score: this._score,
      accuracy: this.accuracy,
      avgTime: this.timeAvg,
      streak: this._bestStreak,
    };
  }

  reset() {
    this._score = 0;
    this._timeAvg = [];
    this._streak = 0;
    this._bestStreak = 0;
    this._correct = 0;
    this._total = 0;
  }
}

// ─────────────────────────────────────────────
//  GameSession — owns game state + scoring
// ─────────────────────────────────────────────

class GameSession {
  constructor(questions, settings, players) {
    this.questions = questions;
    this.settings  = settings;
    this.players   = players;           // Player[]
    this.qIndex    = 0;
    this.timeRemaining = settings.timeLimit || 0;
    this._timerInterval = null;
  }

  get currentQuestion() {
    return this.questions[this.qIndex] || null;
  }

  get isLastQuestion() {
    return this.qIndex >= this.questions.length - 1;
  }

  advance() {
    this.qIndex++;
  }

  // ─── Scoring ──────────────────────────────────
  //
  // Call once per question after host selects who got it right.
  //   correctPlayers  — Player[] who got it right
  //   wrongPlayers    — Player[] explicitly marked wrong (penalty mode)
  //   timeUsed        — seconds elapsed when revealed (0 if no timer)

  awardPoints({ correctPlayers = [], wrongPlayers = [], timeUsed = 0 } = {}) {
    const { timeLimit, speedBonus, penalty, streakBonus } = this.settings;
    const BASE = 100;

    for (const player of correctPlayers) {
      let pts = BASE;

      // Speed bonus
      if (speedBonus && timeLimit > 0) {
        const remaining = Math.max(0, timeLimit - timeUsed);
        pts += Math.floor((remaining / timeLimit) * 50);
      }

      // Streak: increment first, then apply multiplier
      player.incrementStreak();
      if (streakBonus) {
        const s = player.streak;
        if (s >= 5) pts = Math.round(pts * 2);
        else if (s >= 3) pts = Math.round(pts * 1.5);
      }

      player.addPoints(pts);
      player.recordAnswer(true);
      player.recordTime(timeUsed);
    }

    // Wrong-answer penalty
    if (penalty) {
      for (const player of wrongPlayers) {
        player.addPoints(-50);
        player.recordAnswer(false);
        player.resetStreak();
      }
    }

    // Nobody — reset all streaks
    if (correctPlayers.length === 0) {
      for (const player of this.players) player.resetStreak();
    }
  }

  // ─── Timer ────────────────────────────────────

  startTimer(onTick, onExpire) {
    if (!this.settings.timeLimit) return;
    this.timeRemaining = this.settings.timeLimit;
    this._timerInterval = setInterval(() => {
      this.timeRemaining--;
      onTick(this.timeRemaining);
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        onExpire();
      }
    }, 1000);
  }

  stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  // ─── Persist / restore ────────────────────────

  save() {
    const snapshot = {
      inProgress:    true,
      questionIndex: this.qIndex,
      settings:      this.settings,
      questions:     this.questions,
      players:       this.players.map((p) => ({
        name: p.name, score: p.score,
        correct: p._correct, total: p._total,
        streak: p._streak, bestStreak: p._bestStreak,
        timeAvg: p._timeAvg,
      })),
    };
    try {
      localStorage.setItem("trivia_session", JSON.stringify(snapshot));
    } catch (_) {}
  }

  static load() {
    try {
      const raw = localStorage.getItem("trivia_session");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  static clear() {
    localStorage.removeItem("trivia_session");
  }
}

window.Player      = Player;
window.GameSession = GameSession;
