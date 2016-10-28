(function(Proton, undefined) {

    /**
     * Radius is init particle's Radius
     * @param {Number} a - the Radius's start point
     * @param {Number} b - the Radius's end point  
     * @param {String} c - span's center 
     * @example 
     * var Radius = new Proton.Radius(3,5);
     * or
     * var Radius = new Proton.Radius(3,1,"center");
     * @extends {Initialize}
     * @constructor
     */
    function Radius(a, b, c) {
        Radius._super_.call(this);
        this.radius = Proton.createSpan(a, b, c);
    }


    Proton.Util.inherits(Radius, Proton.Initialize);
    Radius.prototype.reset = function(a, b, c) {
        this.radius = Proton.createSpan(a, b, c);
    };

    Radius.prototype.initialize = function(particle) {
        particle.radius = this.radius.getValue();
        particle.transform.oldRadius = particle.radius;
    };

    Proton.Radius = Radius;
})(Proton);
