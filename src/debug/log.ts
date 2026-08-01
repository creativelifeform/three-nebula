/**
 * You can use this emit particles.
 *
 * This method will console.log the fixed number of your info  in updata or requestAnimationFrame
 *
 * use like this log('+12',mc); log 12 times
 *
 * @return void
 */
export default function (this: unknown) {
  let once = 0;

  if (window.console && typeof window.console.trace === 'function') {
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
      // Pre-existing legacy branch: `this` is undefined under ESM strict mode,
      // so this throws exactly as it did before — annotated only to satisfy
      // noImplicitThis without altering the (broken) runtime behaviour.
      (this as (...args: unknown[]) => unknown).apply(console, arg);
    }
  }
}
