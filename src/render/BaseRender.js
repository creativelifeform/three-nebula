(function(Proton, undefined) {

    function BaseRender() { this.name = "BaseRender"; }

    BaseRender.prototype = {
        init: function(proton) {
            var self = this;
            this.proton = proton;
            
            this.proton.addEventListener("PROTON_UPDATE", function(proton) {
                self.onProtonUpdate.call(self, proton);
            });

            this.proton.addEventListener("PARTICLE_CREATED", function(particle) {
                self.onParticleCreated.call(self, particle);
            });

            this.proton.addEventListener("PARTICLE_UPDATE", function(particle) {
                self.onParticleUpdate.call(self, particle);
            });

            this.proton.addEventListener("PARTICLE_DEAD", function(particle) {
                self.onParticleDead.call(self, particle);
            });
        },

        remove: function(proton) {
            // this.proton.removeEventListener("PROTON_UPDATE", this.onProtonUpdate);
            // this.proton.removeEventListener("PARTICLE_CREATED", this.onParticleCreated);
            // this.proton.removeEventListener("PARTICLE_UPDATE", this.onParticleUpdate);
            // this.proton.removeEventListener("PARTICLE_DEAD", this.onParticleDead);
            this.proton = null;
        },

        onParticleCreated: function(particle) {

        },

        onParticleUpdate: function(particle) {

        },

        onParticleDead: function(particle) {

        },

        onProtonUpdate: function(proton) {

        }
    }

    Proton.BaseRender = BaseRender;
})(Proton);
