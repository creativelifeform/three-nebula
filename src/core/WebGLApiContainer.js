export default class WebGLApiContainer {
  set(api) {
    this.api = api;
  }

  get() {
    return this.api;
  }
}
