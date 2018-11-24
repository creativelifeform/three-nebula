export default class Initialize {
  constructor() {
    this.name = 'Initialize';
  }

  init(emitter, particle) {
    if (particle) {
      this.initialize(particle);
    } else {
      this.initialize(emitter);
    }
  }

  /**
   * @abstract
   */
  reset() {}

  /**
   * @abstract
   */
  initialize(target) {} // eslint-disable-line
}
