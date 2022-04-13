import StackFrame from "./stack-frame.js";

export default class ConsoleFriendlyError {
  cause;
  originalStack;

  constructor(error) {
    this.cause = error.cause;
    this.originalStack = error.stack
      .trimEnd()
      .split("\n")
      .map((line) => new StackFrame(line.split("@")));
  }
}
