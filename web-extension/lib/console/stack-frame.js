export default class StackFrame {
  functionName;
  location;

  constructor(array) {
    [this.functionName, this.location] = array;
  }
}
