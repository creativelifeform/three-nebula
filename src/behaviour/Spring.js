(function(Proton, undefined) {
    /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
    function Spring(x, y, z, spring, friction, life, easing) {
        Spring._super_.call(this, life, easing);
        Spring.prototype.reset(x, y, z, spring, friction);
        this.name = "Spring";
    }

    Proton.Util.inherits(Spring, Proton.Behaviour);
    Spring.prototype.reset = function(x, y, z, spring, friction) {
        if (!this.pos)
            this.pos = new Proton.Vector3D(x, y, z);
        else
            this.pos.set(x, y, z);
        this.spring = spring || .1;
        this.friction = friction || .98;
    }

    Spring.prototype.applyBehaviour = function(particle, time, index) {
        Spring._super_.prototype.applyBehaviour.call(this, particle, time, index);

        particle.v.x += (this.pos.x - particle.p.x) * this.spring;
        particle.v.y += (this.pos.y - particle.p.y) * this.spring;
        particle.v.z += (this.pos.z - particle.p.z) * this.spring;

    };


    Proton.Spring = Spring;
})(Proton);
