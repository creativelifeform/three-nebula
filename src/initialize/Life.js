(function(Proton, undefined) {
    /**
     * Life is init particle's Life
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
    function Life(a, b, c) {
        Life._super_.call(this);
        this.lifePan = Proton.createSpan(a, b, c);
    }


    Proton.Util.inherits(Life, Proton.Initialize);
    Life.prototype.initialize = function(target) {
        if (this.lifePan.a == Infinity || this.lifePan.a == "infi")
            target.life = Infinity;
        else
            target.life = this.lifePan.getValue();
    };


    Proton.Life = Life;
})(Proton);
