(function(Proton, undefined) {
    /**
     * Position is init particle's Position
     * @param {Zone} zone - the Position zone
     * @example 
     * var Position = new Proton.Position(new Proton.PointZone(30,100,0));
     * or
     * var Position = new Proton.Position(Infinity);
     * @extends {Proton.Initialize}
     * @constructor
     */
    function Position() {
        Position._super_.call(this);
        this.reset.apply(this, arguments);
    }


    Proton.Util.inherits(Position, Proton.Initialize);
    Position.prototype.reset = function() {
        if (!this.zones) this.zones = [];
        else this.zones.length = 0;

        var args = Array.prototype.slice.call(arguments);
        this.zones = this.zones.concat(args);
    };

    Position.prototype.addZone = function() {
        var args = Array.prototype.slice.call(arguments);
        this.zones = this.zones.concat(args);
    };

    Position.prototype.initialize = function() {
        var zone;
        return function(target) {
            var zone = this.zones[(Math.random() * this.zones.length) >> 0];
            zone.getPosition();

            target.p.x = zone.vector.x;
            target.p.y = zone.vector.y;
            target.p.z = zone.vector.z;
        }
    }();


    Proton.Position = Position;
    Proton.P = Position;

})(Proton);
