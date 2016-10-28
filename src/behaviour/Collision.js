(function(Proton, undefined) {
    /**
     * The Scale class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */
    //can use Collision(emitter,true,function(){}) or Collision();
    function Collision(emitter, useMass, callback, life, easing) {
        Collision._super_.call(this, life, easing);
        this.reset(emitter, useMass, callback);
        this.name = "Collision";
    }

    Proton.Util.inherits(Collision, Proton.Behaviour);
    Collision.prototype.reset = function(emitter, useMass, callback, life, easing) {
        this.emitter = emitter;
        this.useMass = useMass;
        this.callback = callback;
        this.particles = [];
        this.delta = new Proton.Vector3D();
        life && Collision._super_.prototype.reset.call(this, life, easing);
    }

    Collision.prototype.applyBehaviour = function(particle, time, index) {
        var particles = this.emitter ? this.emitter.particles.slice(index) : this.particles.slice(index);
        var otherParticle, lengthSq, overlap, distance;
        var averageMass1, averageMass2;
        
        var i = particles.length;
        while (i--) {
            otherParticle = particles[i];
            if (otherParticle == particle) continue;
            
            this.delta.copy(otherParticle.p).sub(particle.p);
            lengthSq = this.delta.lengthSq();
            distance = particle.radius + otherParticle.radius;

            if (lengthSq <= distance * distance) {
                overlap = distance - Math.sqrt(lengthSq);
                overlap += 0.5;

                averageMass1 = this._getAverageMass(particle, otherParticle);
                averageMass2 = this._getAverageMass(otherParticle, particle);

                particle.p.add(this.delta.clone().normalize().scalar(overlap * -averageMass1));
                otherParticle.p.add(this.delta.normalize().scalar(overlap * averageMass2));

                this.callback && this.callback(particle, otherParticle);
            }
        }
    };

    Collision.prototype._getAverageMass = function(aPartcile, bParticle) {
        return this.useMass ? bParticle.mass / (aPartcile.mass + bParticle.mass) : 0.5;
    }

    Proton.Collision = Collision;

})(Proton);
