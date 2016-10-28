(function(Proton, undefined) {
    /**
     * SphereZone is a sphere zone
     * @param {Number|Vector3D} x - the center's x value or a Vector3D Object
     * @param {Number} y - the center's y value or the Sphere's radius 
     * @param {Number} z - the center's z value 
     * @param {Number} r - the Sphere's radius 
     * @example 
     * var sphereZone = new Proton.SphereZone(0,0,0,100);
     * var sphereZone = new Proton.SphereZone(new Proton.Vector3D(0,0,0),100);
     * @extends {Proton.Zone}
     * @constructor
     */
    function SphereZone(a, b, c, d) {
        var x, y, z, r;
        SphereZone._super_.call(this);
        if (Proton.Util.isUndefined(b, c, d)) {
            x = y = z = 0;
            r = (a || 100);
        } else {
            x = a;
            y = b;
            z = c;
            r = d;
        }

        this.x = x;
        this.y = x;
        this.z = x;
        this.radius = r;
        this.the = this.phi = 0;
    }

    Proton.Util.inherits(SphereZone, Proton.Zone);
    SphereZone.prototype.getPosition = function() {
        var the, phi, r;
        return function() {
            this.random = Math.random();

            r = this.random * this.radius;
            tha = Proton.PI * Math.random(); //[0-pi]
            phi = Proton.PI * 2 * Math.random(); //[0-2pi]

            this.vector.x = this.x + r * Math.sin(tha) * Math.cos(phi);
            this.vector.y = this.y + r * Math.sin(phi) * Math.sin(tha);
            this.vector.z = this.z + r * Math.cos(tha);

            return this.vector;
        }
    }();

    SphereZone.prototype._dead = function(particle) {
        var d = particle.p.distanceTo(this);
        if (d - particle.radius > this.radius) particle.dead = true;
    }

    SphereZone.prototype._bound = function() {
        var normal = new Proton.Vector3D,
            v = new Proton.Vector3D,
            k;

        return function(particle) {
            var d = particle.p.distanceTo(this);
            if (d + particle.radius >= this.radius) {
                normal.copy(particle.p).sub(this).normalize();
                v.copy(particle.v);
                k = 2 * v.dot(normal);
                particle.v.sub(normal.scalar(k));
            }
        }
    }();

    SphereZone.prototype._cross = function(particle) {
        if (this.log) {
            console.error('Sorry SphereZone does not support _cross method');
            this.log = false;
        }
    }

    Proton.SphereZone = SphereZone;

})(Proton);
