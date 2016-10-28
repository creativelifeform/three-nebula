(function(Proton, undefined) {

    function PointsRender(ps) {
        PointsRender._super_.call(this);
        this.points = ps;
        this.name = "PointsRender";
    }

    Proton.Util.inherits(PointsRender, Proton.BaseRender);

    PointsRender.prototype.onProtonUpdate = function() {
        
    };

    PointsRender.prototype.onParticleCreated = function(particle) {
        if (!particle.target) {
            particle.target = new THREE.Vector3();
        }

        particle.target.copy(particle.p);
        this.points.geometry.vertices.push(particle.target);
    };

    PointsRender.prototype.onParticleUpdate = function(particle) {
        if (particle.target) {
            particle.target.copy(particle.p);
        }
    };

    PointsRender.prototype.onParticleDead = function(particle) {
        if (particle.target) {
            var index = this.points.geometry.vertices.indexOf(particle.target);
            if (index > -1)
                this.points.geometry.vertices.splice(index, 1);
            
            particle.target = null;
        }
    };

    Proton.PointsRender = PointsRender;
})(Proton);
