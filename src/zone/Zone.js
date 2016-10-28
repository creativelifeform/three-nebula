(function(Proton, undefined) {
    /**
     * Zone is a base class.
     * @constructor
     */
    function Zone() {
        this.vector = new Proton.Vector3D(0, 0, 0);
        this.random = 0;
        this.crossType = "dead";
        this.log = true;
    }

    Zone.prototype = {
        getPosition: function() {
            return null;
        },

        crossing: function(particle) {
            switch (this.crossType) {
                case "bound":
                    this._bound(particle);
                    break;

                case "cross":
                    this._cross(particle);
                    break;

                case "dead":
                    this._dead(particle);
                    break;
            }
        },

        _dead: function(particle) {},
        _bound: function(particle) {},
        _cross: function(particle) {},
    };

    Proton.Zone = Zone;
})(Proton);
