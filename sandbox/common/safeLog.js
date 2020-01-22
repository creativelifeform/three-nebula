const LOG_MAX = 1;
let loggedTimes = 0;

window.safeLog = (message, max = LOG_MAX) => {
  if (loggedTimes < LOG_MAX) {
    console.log(message);
  }

  loggedTimes++;
};
