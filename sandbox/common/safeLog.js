const LOG_MAX = 10;
let loggedTimes = 0;

window.safeLog = (message, max = LOG_MAX) => {
  if (loggedTimes < LOG_MAX) {
    console.log(message);
  }

  loggedTimes++;
};

window.SafeLog = class {
  constructor(message, max = LOG_MAX) {
    this.message = message;
    this.max = LOG_MAX;
    this.loggedTimes = 0;
  }

  log() {
    if (this.loggedTimes < this.max) {
      console.log(this.message);
    }

    this.loggedTimes++;
  }

  reset() {
    this.loggedTimes = 0;
  }
};
