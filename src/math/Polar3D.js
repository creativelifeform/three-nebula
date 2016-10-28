(function(Proton, undefined) {
    var Polar3D = function(radius, theta, phi) {
        this.radius = radius || 1;
        this.phi = phi || 0;
        this.theta = theta || 0;
    }

    Polar3D.prototype = {
        set: function(radius, theta, phi) {
            this.radius = radius || 1;
            this.phi = phi || 0;
            this.theta = theta || 0;

            return this;
        },

        setRadius: function(radius) {
            this.radius = radius;
            return this;
        },

        setPhi: function(phi) {
            this.phi = phi;
            return this;
        },

        setTheta: function(theta) {
            this.theta = theta;
            return this;
        },

        copy: function(p) {
            this.radius = p.radius;
            this.phi = p.phi;
            this.theta = p.theta;
            return this;
        },

        toVector3D: function() {
            return new Proton.Vector3D(this.getX(), this.getY(), this.getZ());
        },

        getX: function() {
            return this.radius * Math.sin(this.theta) * Math.cos(this.phi);
        },

        getY: function() {
            return -this.radius * Math.sin(this.theta) * Math.sin(this.phi);
        },

        getZ: function() {
            return this.radius * Math.cos(this.theta);
        },

        normalize: function() {
            this.radius = 1;
            return this;
        },

        equals: function(v) {
            return ((v.radius === this.radius) && (v.phi === this.phi) && (v.theta === this.theta));
        },

        clear: function() {
            this.radius = 0.0;
            this.phi = 0.0;
            this.theta = 0.0;
            return this;
        },

        clone: function() {
            return new Polar3D(this.radius, this.phi, this.theta);
        }
    };


    Proton.Polar3D = Polar3D;
})(Proton);
