export default class ContentScriptResponseError extends Error {
  constructor(message, response, options) {
    super(message, {
      response: response,
      ...options,
    });
  }
}
