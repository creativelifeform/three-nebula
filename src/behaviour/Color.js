(function(Proton, undefined) {
    /**
     * The Scale class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */
    function Color(a, b, life, easing) {
        Color._super_.call(this, life, easing);
        this.reset(a, b);
        this.name = "Color";
    }


    Proton.Util.inherits(Color, Proton.Behaviour);
    Color.prototype.reset = function(a, b, life, easing) {
        if (b == null || b == undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createArraySpan(a);
        this.b = Proton.createArraySpan(b);
        life && Color._super_.prototype.reset.call(this, life, easing);
    }

    Color.prototype.initialize = function(particle) {
        particle.transform.colorA = Proton.ColorUtil.getRGB(this.a.getValue());

        particle.useColor = true;
        if (this._same)
            particle.transform.colorB = particle.transform.colorA;
        else
            particle.transform.colorB = Proton.ColorUtil.getRGB(this.b.getValue());
    };

    Color.prototype.applyBehaviour = function(particle, time, index) {
        Color._super_.prototype.applyBehaviour.call(this, particle, time, index);

        if (!this._same) {
            particle.color.r = Proton.MathUtils.lerp(particle.transform.colorA.r, particle.transform.colorB.r, this.energy) ;
            particle.color.g = Proton.MathUtils.lerp(particle.transform.colorA.g, particle.transform.colorB.g, this.energy) ;
            particle.color.b = Proton.MathUtils.lerp(particle.transform.colorA.b, particle.transform.colorB.b, this.energy) ;
        } else {
            particle.color.r = particle.transform.colorA.r;
            particle.color.g = particle.transform.colorA.g;
            particle.color.b = particle.transform.colorA.b;
        }
    };


    Proton.Color = Color;
})(Proton);
