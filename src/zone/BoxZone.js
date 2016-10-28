(function(Proton, undefined) {
    /**
     * BoxZone is a box zone
     * @param {Number|Proton.Vector3D} x - the position's x value or a Proton.Vector3D Object
     * @param {Number} y - the position's y value 
     * @param {Number} z - the position's z value 
     * @param {Number} w - the Box's width 
     * @param {Number} h - the Box's height 
     * @param {Number} d - the Box's depth 
     * @example 
     * var boxZone = new Proton.BoxZone(0,0,0,50,50,50);
     * or
     * var boxZone = new Proton.BoxZone(new Proton.Proton.Vector3D(0,0,0), 50, 50, 50);
     * @extends {Proton.Zone}
     * @constructor
     */
    function BoxZone(a, b, c, d, e, f) {
        var x, y, z, w, h, d;
        BoxZone._super_.call(this);
        
        if (Proton.Util.isUndefined(b, c, d, e, f)) {
            x = y = z = 0;
            w = h = d = (a || 100);
        } else if (Proton.Util.isUndefined(d, e, f)) {
            x = y = z = 0;
            w = a;
            h = b;
            d = c;
        } else {
            x = a;
            y = b;
            z = c;
            w = d;
            h = e;
            d = f;
        }

        this.x = x;
        this.y = y;
        this.z = z;
        this.width = w;
        this.height = h;
        this.depth = d;
    }

    Proton.Util.inherits(BoxZone, Proton.Zone);
    BoxZone.prototype.getPosition = function() {
        this.vector.x = this.x + Proton.MathUtils.randomAToB(-.5, .5) * this.width;
        this.vector.y = this.y + Proton.MathUtils.randomAToB(-.5, .5) * this.height;
        this.vector.z = this.z + Proton.MathUtils.randomAToB(-.5, .5) * this.depth;
        return this.vector;
    }

    BoxZone.prototype._dead = function(particle) {
        if (particle.p.x + particle.radius < this.x - this.width / 2)
            particle.dead = true;
        else if (particle.p.x - particle.radius > this.x + this.width / 2)
            particle.dead = true;

        if (particle.p.y + particle.radius < this.y - this.height / 2)
            particle.dead = true;
        else if (particle.p.y - particle.radius > this.y + this.height / 2)
            particle.dead = true;

        if (particle.p.z + particle.radius < this.z - this.depth / 2)
            particle.dead = true;
        else if (particle.p.z - particle.radius > this.z + this.depth / 2)
            particle.dead = true;
    }

    BoxZone.prototype._bound = function(particle) {
        if (particle.p.x - particle.radius < this.x - this.width / 2) {
            particle.p.x = this.x - this.width / 2 + particle.radius;
            particle.v.x *= -1;
        } else if (particle.p.x + particle.radius > this.x + this.width / 2) {
            particle.p.x = this.x + this.width / 2 - particle.radius;
            particle.v.x *= -1;
        }

        if (particle.p.y - particle.radius < this.y - this.height / 2) {
            particle.p.y = this.y - this.height / 2 + particle.radius;
            particle.v.y *= -1;
        } else if (particle.p.y + particle.radius > this.y + this.height / 2) {
            particle.p.y = this.y + this.height / 2 - particle.radius;
            particle.v.y *= -1;
        }

        if (particle.p.z - particle.radius < this.z - this.depth / 2) {
            particle.p.z = this.z - this.depth / 2 + particle.radius;
            particle.v.z *= -1;
        } else if (particle.p.z + particle.radius > this.z + this.depth / 2) {
            particle.p.z = this.z + this.depth / 2 - particle.radius;
            particle.v.z *= -1;
        }
    }

    BoxZone.prototype._cross = function(particle) {
        if (particle.p.x + particle.radius < this.x - this.width / 2 && particle.v.x <= 0)
            particle.p.x = this.x + this.width / 2 + particle.radius;
        else if (particle.p.x - particle.radius > this.x + this.width / 2 && particle.v.x >= 0)
            particle.p.x = this.x - this.width / 2 - particle.radius;

        if (particle.p.y + particle.radius < this.y - this.height / 2 && particle.v.y <= 0)
            particle.p.y = this.y + this.height / 2 + particle.radius;
        else if (particle.p.y - particle.radius > this.y + this.height / 2 && particle.v.y >= 0)
            particle.p.y = this.y - this.height / 2 - particle.radius;

        if (particle.p.z + particle.radius < this.z - this.depth / 2 && particle.v.z <= 0)
            particle.p.z = this.z + this.depth / 2 + particle.radius;
        else if (particle.p.z - particle.radius > this.z + this.depth / 2 && particle.v.z >= 0)
            particle.p.z = this.z - this.depth / 2 - particle.radius;
    }

    Proton.BoxZone = BoxZone;
})(Proton);
