(function(Proton, undefined) {
    /**
     * Mass is init particle's Mass
     * @param {Number} a - the Mass's start point
     * @param {Number} b - the Mass's end point  
     * @param {String} c - span's center 
     * @example 
     * var Mass = new Proton.Mass(3,5);
     * or
     * var Mass = new Proton.Mass(Infinity);
     * @extends {Initialize}
     * @constructor
     */
    function Mass(a, b, c) {
        Mass._super_.call(this);
        this.massPan = Proton.createSpan(a, b, c);
    }


    Proton.Util.inherits(Mass, Proton.Initialize);
    Mass.prototype.initialize = function(target) {
        target.mass = this.massPan.getValue();
    };

    Proton.Mass = Mass;
})(Proton);
