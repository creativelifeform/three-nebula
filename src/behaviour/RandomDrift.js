(function(Proton, undefined) {
    /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
    function RandomDrift(driftX, driftY, driftZ, delay, life, easing) {
        RandomDrift._super_.call(this, life, easing);
        this.reset(driftX, driftY, driftZ, delay);
        this.time = 0;
        this.name = "RandomDrift";
    }


    Proton.Util.inherits(RandomDrift, Proton.Behaviour);
    RandomDrift.prototype.reset = function(driftX, driftY, driftZ, delay, life, easing) {
        this.randomFoce = this.normalizeForce(new Proton.Vector3D(driftX, driftY, driftZ));
        this.delayPan = Proton.createSpan(delay || .03);
        this.time = 0;
        life && RandomDrift._super_.prototype.reset.call(this, life, easing);
    }

    RandomDrift.prototype.applyBehaviour = function(particle, time, index) {
        RandomDrift._super_.prototype.applyBehaviour.call(this, particle, time, index);

        this.time += time;
        if (this.time >= this.delayPan.getValue()) {
            var ax = Proton.MathUtils.randomAToB(-this.randomFoce.x, this.randomFoce.x);
            var ay = Proton.MathUtils.randomAToB(-this.randomFoce.y, this.randomFoce.y);
            var az = Proton.MathUtils.randomAToB(-this.randomFoce.z, this.randomFoce.z);
            particle.a.addValue(ax, ay, az);
            this.time = 0;
        };
    };

    Proton.RandomDrift = RandomDrift;
})(Proton);
