//@author mrdoob / http://mrdoob.com/
(function(Proton, undefined) {
    var Vector3D = function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Vector3D.prototype = {
        set: function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        },

        setX: function(x) {
            this.x = x;
            return this;
        },

        setY: function(y) {
            this.y = y;
            return this;
        },

        setZ: function(z) {
            this.z = z;
            return this;
        },

        getGradient: function() {
            if (this.x != 0)
                return Math.atan2(this.y, this.x);
            else if (this.y > 0)
                return Proton.PI / 2;
            else if (this.y < 0)
                return -Proton.PI / 2;
        },

        copy: function(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        },

        add: function(v, w) {
            if (w !== undefined) return this.addVectors(v, w);

            this.x += v.x;
            this.y += v.y;
            this.z += v.z;

            return this;

        },

        addValue: function(a, b, c) {
            this.x += a;
            this.y += b;
            this.z += c;

            return this;

        },

        addVectors: function(a, b) {
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;

            return this;
        },

        addScalar: function(s) {
            this.x += s;
            this.y += s;
            this.z += s;

            return this;
        },

        sub: function(v, w) {
            if (w !== undefined) return this.subVectors(v, w);

            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;

            return this;
        },

        subVectors: function(a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            return this;
        },

        scalar: function(s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;

            return this;
        },

        divideScalar: function(s) {
            if (s !== 0) {
                this.x /= s;
                this.y /= s;
                this.z /= s;
            } else {
                this.set(0, 0, 0);
            }

            return this;
        },

        negate: function() {
            return this.scalar(-1);
        },

        dot: function(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },

        cross: function(v) {
            var x = this.x,
                y = this.y,
                z = this.z;

            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;

            return this;
        },

        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },

        length: function() {
            return Math.sqrt(this.lengthSq());
        },

        normalize: function() {
            return this.divideScalar(this.length());
        },

        distanceTo: function(v) {
            return Math.sqrt(this.distanceToSquared(v));
        },

        crossVectors: function(a, b) {

            var ax = a.x,
                ay = a.y,
                az = a.z;
            var bx = b.x,
                by = b.y,
                bz = b.z;

            this.x = ay * bz - az * by;
            this.y = az * bx - ax * bz;
            this.z = ax * by - ay * bx;

            return this;

        },

        // eulerFromDir: function() {
        //     var quaternion, dir, up;

        //     return function rotateFromDir(direction) {
        //         if (quaternion === undefined) quaternion = new Proton.Quaternion();
        //         if (dir === undefined) dir = new Proton.Vector3D;
        //         if (up === undefined) up = new Proton.Vector3D(0, 0, 1);

        //         //quaternion.setFromUnitVectors(up, dir.copy(direction).normalize());
        //         console.log(quaternion.setFromUnitVectors(up, dir.copy(direction).normalize()));

        //         this.applyQuaternion(quaternion.setFromUnitVectors(up, dir.copy(direction).normalize()));
        //             console.log(this);
        //         return this;
        //     };
        // }(),

        eulerFromDir: function(dir) {
            
        },

        applyEuler: function() {
            var quaternion;

            return function applyEuler(euler) {
                if (quaternion === undefined) quaternion = new Proton.Quaternion();
                this.applyQuaternion(quaternion.setFromEuler(euler));
                return this;
            };
        }(),

        applyAxisAngle: function() {
            var quaternion;
            return function applyAxisAngle(axis, angle) {
                if (quaternion === undefined) quaternion = new Proton.Quaternion();
                this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
                return this;
            };
        }(),

        applyQuaternion: function(q) {
            var x = this.x;
            var y = this.y;
            var z = this.z;

            var qx = q.x;
            var qy = q.y;
            var qz = q.z;
            var qw = q.w;

            // calculate quat * vector

            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;

            // calculate result * inverse quat
            this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
        },

        distanceToSquared: function(v) {
            var dx = this.x - v.x,
                dy = this.y - v.y,
                dz = this.z - v.z;

            return dx * dx + dy * dy + dz * dz;
        },

        lerp: function(v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        },

        equals: function(v) {
            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        },

        clear: function() {
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            return this;
        },

        clone: function() {
            return new Proton.Vector3D(this.x, this.y, this.z);
        },

        toString: function() {
            return "x:" + this.x + "y:" + this.y + "z:" + this.z;
        }
    };

    Proton.Vector3D = Vector3D;
})(Proton);
