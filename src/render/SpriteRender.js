(function(Proton, undefined) {

    function SpriteRender(container) {
        SpriteRender._super_.call(this, container);

        this._body = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff }));
        this.name = "SpriteRender";
    }

    Proton.Util.inherits(SpriteRender, Proton.MeshRender);

    SpriteRender.prototype.scale = function(particle) {
        particle.target.scale.set(particle.scale * particle.radius, particle.scale * particle.radius, 1);
    };

    Proton.SpriteRender = SpriteRender;
})(Proton);
