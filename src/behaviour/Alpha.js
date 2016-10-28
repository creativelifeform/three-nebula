(function(Proton, undefined) {

    /**
     * The Alpha class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */

    function Alpha(a, b, life, easing) {
        Alpha._super_.call(this, life, easing);
        this.reset(a, b);
        /**
         * The Proton.Behaviour name;
         * @property name
         * @type {string}
         */
        this.name = "Alpha";
    }


    Proton.Util.inherits(Alpha, Proton.Behaviour);
    Alpha.prototype.reset = function(a, b, life, easing) {
        if (b == null || b == undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createSpan(Proton.Util.initValue(a, 1));
        this.b = Proton.createSpan(b);
        life && Alpha._super_.prototype.reset.call(this, life, easing);
    }

    Alpha.prototype.initialize = function(particle) {
        particle.useAlpha = true;
        particle.transform.alphaA = this.a.getValue();
        if (this._same)
            particle.transform.alphaB = particle.transform.alphaA;
        else
            particle.transform.alphaB = this.b.getValue();
    };

    Alpha.prototype.applyBehaviour = function(particle, time, index) {
        Alpha._super_.prototype.applyBehaviour.call(this, particle, time, index);

        particle.alpha = Proton.MathUtils.lerp(particle.transform.alphaA, particle.transform.alphaB, this.energy);
        if (particle.alpha < 0.002) particle.alpha = 0;
    };

    Proton.Alpha = Alpha;
})(Proton);
