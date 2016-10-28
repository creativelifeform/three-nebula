(function(Proton, undefined) {
    function PosSpring(spring, friction, life, easing) {
        PosSpring._super_.call(this, life, easing);
        PosSpring.prototype.reset(spring, friction);
        this.name = "Spring";
    }

    Proton.Util.inherits(PosSpring, Proton.Behaviour);
    PosSpring.prototype.reset = function(spring, friction) {
        this.spring = spring || .1;
        this.friction = friction || .98;
    }

    PosSpring.prototype.initialize = function(particle) {
        particle.transform.pos = particle.p.clone();
    };

    PosSpring.prototype.applyBehaviour = function(particle, time, index) {
        PosSpring._super_.prototype.applyBehaviour.call(this, particle, time, index);
        particle.v.x += (particle.transform.pos.x - particle.p.x) * this.spring;
        particle.v.y += (particle.transform.pos.y - particle.p.y) * this.spring;
        particle.v.z += (particle.transform.pos.z - particle.p.z) * this.spring;
    };
    
    Proton.PosSpring = PosSpring;
})(Proton);
