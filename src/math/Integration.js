//数值积分
(function(Proton, undefined) {
    var Integration = function(type) {
        this.type = Proton.Util.initValue(type, Proton.EULER);
    }

    Integration.prototype = {
        integrate: function(particles, time, damping) {
            this.euler(particles, time, damping);
        },

        euler: function(particle, time, damping) {
            if (!particle.sleep) {
                particle.old.p.copy(particle.p);
                particle.old.v.copy(particle.v);
                particle.a.scalar(1 / particle.mass);
                particle.v.add(particle.a.scalar(time));
                particle.p.add(particle.old.v.scalar(time));
                damping && particle.v.scalar(damping);
                particle.a.clear();
            }
        }
    }

    Proton.Integration = Integration;
})(Proton);
