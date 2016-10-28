/**
 * You can use this emit particles.
 *
 * This method will console.log the fixed number of your info  in updata or requestAnimationFrame
 * 
 * use like this Proton.log('+12',mc); log 12 times
 *
 * @class Proton.log
 * @constructor
 * @param {*} logInfo;
 */
(function(Proton, undefined) {
    var log = function() {
        if (window.console && window.console.trace) {
            var arg = Array.prototype.slice.call(arguments);
            var s1 = arguments[0] + "";
            if (s1.indexOf('+') == 0) {
                var n = parseInt(arguments[0]);
                if (log.once < n) {
                    arg.shift();
                    console.trace.apply(console, arg);
                    log.once++;
                }
            } else {
                arg.unshift("+15");
                log.apply(console, arg);
            }
        }
    }

    log.once = 0;
    Proton.log = log;
})(Proton);
