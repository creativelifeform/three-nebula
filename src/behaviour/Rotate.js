(function(Proton, undefined) {

    /* The Rotate class is the base
     * for the other Behaviour
     *
     * @class Behaviour * @constructor 
     * @example new Proton.Rotate(Proton.createSpan(-1,1),Proton.createSpan(-1,1),Proton.createSpan(-1,1)); 
     * @example new Proton.Rotate(); 
     * @example new Proton.Rotate("random"); 
     */

    function Rotate(x, y, z, life, easing) {
        Rotate._super_.call(this, life, easing);
        this.reset(x, y, z);
        this.name = "Rotate";
    }

    Proton.Util.inherits(Rotate, Proton.Behaviour);
    Rotate.prototype.reset = function(a, b, c, life, easing) {
        this.a = a || 0;
        this.b = b || 0;
        this.c = c || 0;

        if (a === undefined || a == "same") {
            this._type = "same";
        } else if (b == undefined) {
            this._type = "set";
        } else if (c === undefined) {
            this._type = "to";
        } else {
            this._type = "add";
            this.a = Proton.createSpan(this.a * Proton.DR);
            this.b = Proton.createSpan(this.b * Proton.DR);
            this.c = Proton.createSpan(this.c * Proton.DR);
        }

        life && Rotate._super_.prototype.reset.call(this, life, easing);
    }

    Rotate.prototype.initialize = function(particle) {
        switch (this._type) {
            case "same":
                break;

            case "set":
                this._setRotation(particle.rotation, this.a);
                break;

            case "to":
                particle.transform.fR = particle.transform.fR || new Proton.Vector3D;
                particle.transform.tR = particle.transform.tR || new Proton.Vector3D;
                this._setRotation(particle.transform.fR, this.a);
                this._setRotation(particle.transform.tR, this.b);
                break;

            case "add":
                particle.transform.addR = new Proton.Vector3D(this.a.getValue(), this.b.getValue(), this.c.getValue());
                break;
        }
    };

    Rotate.prototype._setRotation = function(vec3, value) {
        vec3 = vec3 || new Proton.Vector3D;
        if (value == "random") {
            var x = Proton.MathUtils.randomAToB(-Proton.PI, Proton.PI);
            var y = Proton.MathUtils.randomAToB(-Proton.PI, Proton.PI);
            var z = Proton.MathUtils.randomAToB(-Proton.PI, Proton.PI);
            vec3.set(x, y, z);
        } else if (value instanceof Proton.Vector3D) {
            vec3.copy(value);
        }
    };

    Rotate.prototype.applyBehaviour = function(particle, time, index) {
        Rotate._super_.prototype.applyBehaviour.call(this, particle, time, index);

        switch (this._type) {
            case "same":
                if (!particle.rotation) particle.rotation = new Proton.Vector3D;
                particle.rotation.eulerFromDir(particle.v);
                //http://stackoverflow.com/questions/21622956/how-to-convert-direction-vector-to-euler-angles
                //console.log(particle.rotation);
                break;

            case "set":
                //
                break;

            case "to":
                particle.rotation.x = Proton.MathUtils.lerp(particle.transform.fR.x, particle.transform.tR.x, this.energy);
                particle.rotation.y = Proton.MathUtils.lerp(particle.transform.fR.y, particle.transform.tR.y, this.energy);
                particle.rotation.z = Proton.MathUtils.lerp(particle.transform.fR.z, particle.transform.tR.z, this.energy);
                break;

            case "add":
                particle.rotation.add(particle.transform.addR);
                break;
        }
    };

    Proton.Rotate = Rotate;
})(Proton);
