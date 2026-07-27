// Rate-limited console logging, handy inside per-frame code where a raw
// console.log would flood the console.
const LOG_MAX = 10;
let loggedTimes = 0;

export const safeLog = (message, max = LOG_MAX) => {
  if (loggedTimes < max) {
    console.log(message);
  }

  loggedTimes++;
};

export class SafeLog {
  constructor(message, max = LOG_MAX) {
    this.message = message;
    this.max = max;
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
}
