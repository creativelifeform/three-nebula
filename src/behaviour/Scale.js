(function(Proton, undefined) {
    /**
     * The Scale class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */

    function Scale(a, b, life, easing) {
        Scale._super_.call(this, life, easing);
        this.reset(a, b);
        this.name = "Scale";
    }


    Proton.Util.inherits(Scale, Proton.Behaviour);
    Scale.prototype.reset = function(a, b, life, easing) {
        if (b == null || b == undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createSpan(Proton.Util.initValue(a, 1));
        this.b = Proton.createSpan(b);

        life && Scale._super_.prototype.reset.call(this, life, easing);
    }

    Scale.prototype.initialize = function(particle) {
        particle.transform.scaleA = this.a.getValue();
        particle.transform.oldRadius = particle.radius;
        if (this._same)
            particle.transform.scaleB = particle.transform.scaleA;
        else
            particle.transform.scaleB = this.b.getValue();

    };

    Scale.prototype.applyBehaviour = function(particle, time, index) {
        Scale._super_.prototype.applyBehaviour.call(this, particle, time, index);
        particle.scale = Proton.MathUtils.lerp(particle.transform.scaleA, particle.transform.scaleB, this.energy);

        if (particle.scale < 0.0005) particle.scale = 0;
        particle.radius = particle.transform.oldRadius * particle.scale;
    };

    Proton.Scale = Scale;
})(Proton);
