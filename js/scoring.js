class Player {
  constructor(name, score = 0, timeAvg = [], streak = 0) {
    this._name = name;
    this._score = score;
    this._timeAvg = timeAvg;
    this._streak = streak;
    this._correct = 0;
    this._total = 0;
  }

  // ---------------------- Name -----------------
  get name() {
    return this._name;
  }
  set name(val) {
    if (typeof val !== "string" || val.trim() === "") {
      throw new Error("Name must be a non-empty string.");
    }
    this._name = val.trim();
  }

  // ------------------------ Score -------------------------
  get score() {
    return this._score;
  }
  set score(val) {
    if (typeof val !== "number") throw new Error("Score must be a number.");
    this._score = val;
  }
  addPoints(pts) {
    this._score += pts;
  }

  // ------------------ Time tracking ------------
  get timeAvg() {
    if (this._timeAvg.length === 0) return 0;
    const sum = this._timeAvg.reduce((a, b) => a + b, 0);
    return parseFloat((sum / this._timeAvg.length).toFixed(1));
  }
  recordTime(seconds) {
    if (typeof seconds === "number" && seconds >= 0) {
      this._timeAvg.push(seconds);
    }
  }

  // ------------ Streak ------------
  get streak() {
    return this._streak;
  }
  incrementStreak() {
    this._streak++;
  }
  resetStreak() {
    this._streak = 0;
  }

  // ------------ Answer tracking -------------------
  get correct() {
    return this._correct;
  }
  get total() {
    return this._total;
  }
  get accuracy() {
    if (this._total === 0) return "0 / 0";
    return `${this._correct} / ${this._total}`;
  }

  recordAnswer(isCorrect) {
    this._total++;
    if (isCorrect) this._correct++;
  }

  // ------------------------ Summary (feeds the scores screen) ------------
  getSummary() {
    return {
      name: this._name,
      score: this._score,
      accuracy: this.accuracy,
      avgTime: this.timeAvg,
      streak: this._streak,
    };
  }

  reset() {
    this._score = 0;
    this._timeAvg = [];
    this._streak = 0;
    this._correct = 0;
    this._total = 0;
  }
}
