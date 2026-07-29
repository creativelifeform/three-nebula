/**
 * You can use this emit particles.
 *
 * This method will console.log the fixed number of your info  in updata or requestAnimationFrame
 *
 * use like this log('+12',mc); log 12 times
 *
 * @return void
 */
export default function() {
  let once = 0;

  if (window.console && window.console.trace) {
    var arg = Array.prototype.slice.call(arguments);
    var s1 = arguments[0] + '';

    if (s1.indexOf('+') == 0) {
      var n = parseInt(arguments[0]);

      if (once < n) {
        arg.shift();
        console.trace.apply(console, arg);
        once++;
      }
    } else {
      arg.unshift('+15');
      this.apply(console, arg);
    }
  }
}
