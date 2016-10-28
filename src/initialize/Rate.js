(function(Proton, undefined) {
    /**
     * The number of particles per second emission (a [particle]/b [s]);
     * @class Proton.Rate
     * @constructor
     * @param {Array or Number or Proton.Span} numPan the number of each emission;
     * @param {Array or Number or Proton.Span} timePan the time of each emission;
     * for example: new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(.1, .25));
     */
     
    function Rate(numPan, timePan) {
        this.numPan = Proton.createSpan(Proton.Util.initValue(numPan, 1));
        this.timePan = Proton.createSpan(Proton.Util.initValue(timePan, 1));

        this.startTime = 0;
        this.nextTime = 0;
        this.init();
    }

    Rate.prototype = {
        init: function() {
            this.startTime = 0;
            this.nextTime = this.timePan.getValue();
        },

        getValue: function(time) {
            this.startTime += time;

            if (this.startTime >= this.nextTime) {
                this.init();

                if (this.numPan.b == 1) {
                    if (this.numPan.getValue("Float") > 0.5)
                        return 1;
                    else
                        return 0;
                } else {
                    return this.numPan.getValue("Int");
                }
            }

            return 0;
        }
    }

    Proton.Rate = Rate;
})(Proton);
