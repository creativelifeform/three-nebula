(function(Proton, undefined) {
    /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
    function Force(fx, fy, fz, life, easing) {
        Force._super_.call(this, life, easing);
        Force.prototype.reset(fx, fy, fz);
        this.name = "Force";
    }

    Proton.Util.inherits(Force, Proton.Behaviour);
    Force.prototype.reset = function(fx, fy, fz) {
        this.force = this.normalizeForce(new Proton.Vector3D(fx, fy, fz));
    }

    Force.prototype.applyBehaviour = function(particle, time, index) {
        Force._super_.prototype.applyBehaviour.call(this, particle, time, index);
        particle.a.add(this.force);
    };


    Proton.F = Proton.Force = Force;
})(Proton);
