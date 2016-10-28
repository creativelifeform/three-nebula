(function(Proton, undefined) {
    /**
     * Span Class. Get a random Number from a to b. Or from c-a to c+b
     * @param {Number|Array} a - min number
     * @param {Number} b - max number
     * @param {Number} center - the center's z value  
     * @example 
     * var span = new Proton.Span(0,30);
     * or
     * var span = new Proton.Span(["#fff","#ff0","#000"]);
     * or
     * var span = new Proton.Span(5,1,"center");
     * @extends {Zone}
     * @constructor
     */
    function Span(a, b, center) {
        this._isArray = false;

        if (Proton.Util.isArray(a)) {
            this._isArray = true;
            this.a = a;
        } else {
            this.a = Proton.Util.initValue(a, 1);
            this.b = Proton.Util.initValue(b, this.a);
            this._center = Proton.Util.initValue(center, false);
        }
    }

    /**
     * Span.getValue function
     * @name get a random Number from a to b. Or get a random Number from c-a to c+b
     * @param {number} INT or int
     * @return {number} a random Number
     */
    Span.prototype = {
        getValue: function(INT) {
            if (this._isArray) {
                return this.a[(this.a.length * Math.random()) >> 0];
            } else {
                if (!this._center)
                    return Proton.MathUtils.randomAToB(this.a, this.b, INT);
                else
                    return Proton.MathUtils.randomFloating(this.a, this.b, INT);
            }
        }
    }

    /**
     * Proton.createSpan function
     * @name get a instance of Span
     * @param {number} a min number
     * @param {number} b max number
     * @param {number} c center number
     * @return {number} return a instance of Span
     */
    Proton.createSpan = function(a, b, c) {
        if (a instanceof Span) return a;

        if (b === undefined) {
            return new Span(a);
        } else {
            if (c === undefined)
                return new Span(a, b);
            else
                return new Span(a, b, c);
        }
    }

    Proton.Span = Span;
})(Proton);
