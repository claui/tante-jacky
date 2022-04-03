export default class StepFailedError extends Error {
  #result;

  constructor(message, options) {
    super(message, options);
    this.#result = options?.result ?? "fehlgeschlagen";
  }

  get result() {
    return this.#result;
  }
}
