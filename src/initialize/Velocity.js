(function(Proton, undefined) {
    /**
     * Velocity is init particle's Velocity
     * @param {Number} a - the Life's start point
     * @param {Number} b - the Life's end point  
     * @param {String} c - span's center 
     * @example 
     * var life = new Proton.Life(3,5);
     * or
     * var life = new Proton.Life(Infinity);
     * @extends {Initialize}
     * @constructor
     */
    //radius and tha
    function Velocity(a, b, c) {
        Velocity._super_.call(this);
        this.reset(a, b, c);
        this.dirVec = new Proton.Vector3D(0, 0, 0);

        this.name = "Velocity";
    }

    Proton.Util.inherits(Velocity, Proton.Initialize);

    Velocity.prototype.reset = function(a, b, c) {
        //[vector,tha]
        if (a instanceof Proton.Vector3D) {
            this.radiusPan = Proton.createSpan(1);
            this.dir = a.clone();
            this.tha = b * Proton.DR;
            this._useV = true;
        }

        //[polar,tha]
        else if (a instanceof Proton.Polar3D) {
            this.tha = b * Proton.DR;
            this.dirVec = a.toVector3D();
            this._useV = false;
        }

        //[radius,vector,tha]
        else {
            this.radiusPan = Proton.createSpan(a);
            this.dir = b.clone().normalize();
            this.tha = c * Proton.DR;
            this._useV = true;
        }
    };

    Velocity.prototype.normalize = function(vr) {
        return vr * Proton.MEASURE;
    }

    Velocity.prototype.initialize = function() {
        var tha;
        var normal = new Proton.Vector3D(0, 0, 1);
        var v = new Proton.Vector3D(0, 0, 0);

        return function initialize(target) {
            tha = this.tha * Math.random();
            this._useV && this.dirVec.copy(this.dir).scalar(this.radiusPan.getValue());

            Proton.MathUtils.getNormal(this.dirVec, normal);
            v.copy(this.dirVec).applyAxisAngle(normal, tha);
            v.applyAxisAngle(this.dirVec.normalize(), Math.random() * Proton.PI * 2);

            //use  axisRotate methods
            //Proton.MathUtils.axisRotate(this.v1, this.dirVec, normal, tha);
            //Proton.MathUtils.axisRotate(this.v2, this.v1, this.dirVec.normalize(), Math.random() * Proton.PI * 2);
            target.v.copy(v);
            return this;
        };
    }()

    Proton.Velocity = Velocity;
    Proton.V = Velocity;
})(Proton);
