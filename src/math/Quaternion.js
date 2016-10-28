(function(Proton, undefined) {

    var Quaternion = function(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = (w !== undefined) ? w : 1;
    };

    Quaternion.prototype = {
        set: function(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        },

        clone: function() {
            return new Proton.Quaternion(this.x, this.y, this.z, this.w);
        },

        copy: function(quaternion) {
            this.x = quaternion.x;
            this.y = quaternion.y;
            this.z = quaternion.z;
            this.w = quaternion.w;
            return this;
        },

        setFromEuler: function(euler) {
            // http://www.mathworks.com/matlabcentral/fileexchange/
            //  20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
            //  content/SpinCalc.m

            var c1 = Math.cos(euler.x / 2);
            var c2 = Math.cos(euler.y / 2);
            var c3 = Math.cos(euler.z / 2);
            var s1 = Math.sin(euler.x / 2);
            var s2 = Math.sin(euler.y / 2);
            var s3 = Math.sin(euler.z / 2);

            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;

            return this;

        },

        setFromAxisAngle: function(axis, angle) {
            // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
            // assumes axis is normalized
            var halfAngle = angle / 2,
                s = Math.sin(halfAngle);
            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos(halfAngle);

            return this;
        },

        // setFromUnitVectors: function() {
        //     var v1, r;
        //     var EPS = 0.000001;

        //     return function(vFrom, vTo) {
        //         if (v1 === undefined) v1 = new Proton.Vector3D();

        //         r = vFrom.dot(vTo) + 1;
        //         if (r < EPS) {
        //             r = 0;
        //             if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        //                 v1.set(-vFrom.y, vFrom.x, 0);
        //             } else {
        //                 v1.set(0, -vFrom.z, vFrom.y);
        //             }
        //         } else {
        //             v1.crossVectors(vFrom, vTo);
        //         }

        //         this.x = v1.x;
        //         this.y = v1.y;
        //         this.z = v1.z;
        //         this.w = r;
        //         return this.normalize();
        //     };
        // }(),

        normalize: function() {

            var l = this.length();

            if (l === 0) {

                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 1;

            } else {
                l = 1 / l;
                this.x *= l;
                this.y *= l;
                this.z *= l;
                this.w *= l;

            }
            return this;
        },

        length: function() {

            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

        },

        dot: function(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
        }
    };

    Proton.Quaternion = Quaternion;
})(Proton);
