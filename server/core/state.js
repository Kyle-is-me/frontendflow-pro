class State {
  constructor(input) {
    this.input = input;
    this.steps = [];
    this.logs = [];
    this.files = [];
    this.error = null;
  }

  log(msg) {
    this.logs.push(msg);
    console.log(msg);
  }
}

module.exports = State;