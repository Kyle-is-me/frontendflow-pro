const { v4: uuidv4 } = require("uuid");

class State {
  constructor(input, options = {}) {
    const now = new Date().toISOString();

    this.id = options.id || uuidv4();
    this.input = input;
    this.status = options.status || "queued";
    this.steps = options.steps || [];
    this.logs = options.logs || [];
    this.stepResults = options.stepResults || [];
    this.artifacts = options.artifacts || [];
    this.error = options.error || null;
    this.currentStep = options.currentStep || null;
    this.createdAt = options.createdAt || now;
    this.updatedAt = options.updatedAt || now;
    this.startedAt = options.startedAt || null;
    this.finishedAt = options.finishedAt || null;
    this.meta = options.meta || {};
    this._logHandler = options.logHandler || null;
  }

  setLogHandler(handler) {
    this._logHandler = handler;
  }

  setStatus(status) {
    this.status = status;
    this.updatedAt = new Date().toISOString();

    if (status === "running" && !this.startedAt) {
      this.startedAt = this.updatedAt;
    }

    if (status === "succeeded" || status === "failed") {
      this.finishedAt = this.updatedAt;
    }
  }

  setCurrentStep(stepName) {
    this.currentStep = stepName;
    this.updatedAt = new Date().toISOString();
  }

  addStepResult(result) {
    this.stepResults.push({
      timestamp: new Date().toISOString(),
      ...result
    });
    this.updatedAt = new Date().toISOString();
  }

  addArtifacts(artifacts) {
    this.artifacts.push(...artifacts);
    this.updatedAt = new Date().toISOString();
  }

  log(message, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: details.level || "info",
      stage: details.stage || this.currentStep || "general",
      message,
      meta: details.meta || null
    };

    this.logs.push(entry);
    this.updatedAt = entry.timestamp;

    if (typeof this._logHandler === "function") {
      this._logHandler(entry);
    }

    console.log(`[${entry.level}] [${entry.stage}] ${entry.message}`);
    return entry;
  }

  toJSON() {
    return {
      id: this.id,
      input: this.input,
      status: this.status,
      steps: this.steps,
      logs: this.logs,
      stepResults: this.stepResults,
      artifacts: this.artifacts,
      error: this.error,
      currentStep: this.currentStep,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      meta: this.meta
    };
  }
}

module.exports = State;
