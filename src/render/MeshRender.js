import * as THREE from "three";

(function(Proton, undefined) {
  function MeshRender(container) {
    MeshRender._super_.call(this);
    this.container = container;

    this._targetPool = new Proton.Pool();
    this._materialPool = new Proton.Pool();
    this._body = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: "#ff0000" })
    );

    this.name = "MeshRender";
  }

  Proton.Util.inherits(MeshRender, Proton.BaseRender);

  MeshRender.prototype.onProtonUpdate = function() {};

  MeshRender.prototype.onParticleCreated = function(particle) {
    if (!particle.target) {
      //set target
      if (!particle.body) particle.body = this._body;
      particle.target = this._targetPool.get(particle.body);

      //set material
      if (particle.useAlpha || particle.useColor) {
        particle.target.material.__puid = Proton.PUID.id(
          particle.body.material
        );
        particle.target.material = this._materialPool.get(
          particle.target.material
        );
      }
    }

    if (particle.target) {
      particle.target.position.copy(particle.p);
      this.container.add(particle.target);
    }
  };

  MeshRender.prototype.onParticleUpdate = function(particle) {
    if (particle.target) {
      particle.target.position.copy(particle.p);
      particle.target.rotation.set(
        particle.rotation.x,
        particle.rotation.y,
        particle.rotation.z
      );
      this.scale(particle);

      if (particle.useAlpha) {
        particle.target.material.opacity = particle.alpha;
        particle.target.material.transparent = true;
      }

      if (particle.useColor) {
        particle.target.material.color.copy(particle.color);
      }
    }
  };

  MeshRender.prototype.scale = function(particle) {
    particle.target.scale.set(particle.scale, particle.scale, particle.scale);
  };

  MeshRender.prototype.onParticleDead = function(particle) {
    if (particle.target) {
      if (particle.useAlpha || particle.useColor)
        this._materialPool.expire(particle.target.material);

      this._targetPool.expire(particle.target);
      this.container.remove(particle.target);
      particle.target = null;
    }
  };

  Proton.MeshRender = MeshRender;
})(Proton);
