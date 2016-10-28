(function(Proton, undefined) {

    function CustomRender() {
        CustomRender._super_.call(this);
        this.targetPool = new Proton.Pool();
        this.materialPool = new Proton.Pool();
        
        this.name = "CustomRender";
    }

    Proton.Util.inherits(CustomRender, Proton.BaseRender);

    CustomRender.prototype.onProtonUpdate = function() {};

    CustomRender.prototype.onParticleCreated = function(particle) {
        
    };

    CustomRender.prototype.onParticleUpdate = function(particle) {
        
    };

    CustomRender.prototype.onParticleDead = function(particle) {
        
    };

    Proton.CustomRender = CustomRender;
})(Proton);
