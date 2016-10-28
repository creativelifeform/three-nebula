(function(Proton, undefined) {
    /**
     * ArraySpan name get a random Color from a colors array
     * @param {String|Array} colors - colors array
     * @example 
     * var span = new Proton.ArraySpan(["#fff","#ff0","#000"]);
     * or
     * var span = new Proton.ArraySpan("#ff0");
     * @extends {Proton.Span}
     * @constructor
     */

    function ArraySpan(colors) {
        this._arr = Proton.Util.isArray(colors) ? colors : [colors];
    }

    Proton.Util.inherits(ArraySpan, Proton.Span);

    /**
     * getValue function
     * @name get a random Color
     * @return {string} a hex color
     */
    ArraySpan.prototype.getValue = function() {
        var color = this._arr[(this._arr.length * Math.random()) >> 0];
        
        if (color == 'random' || color == 'Random')
            return Proton.MathUtils.randomColor();
        else
            return color;
    }

    /**
     * Proton.createArraySpan function
     * @name get a instance of Span
     * @param {number} a min number
     * @param {number} b max number
     * @param {number} c center number
     * @return {number} return a instance of Span
     */
    Proton.createArraySpan = function(arr) {
        if (!arr) return null;
        if (arr instanceof Proton.ArraySpan)
            return arr;
        else 
            return new Proton.ArraySpan(arr);
    }

    Proton.ArraySpan = ArraySpan;

})(Proton);
