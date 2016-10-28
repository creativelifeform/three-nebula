(function(Proton, undefined) {
    function Box(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = w;
        this.height = h;
        this.depth = d;
        this.bottom = this.y + this.height;
        this.right = this.x + this.width;
        this.right = this.x + this.width;
    }


    Box.prototype = {
        contains: function(x, y, z) {
            if (
                x <= this.right &&
                x >= this.x &&
                y <= this.bottom &&
                y >= this.y &&
                z <= this.depth &&
                z >= this.z
            )
                return true
            else
                return false
        }
    }

    Proton.Box = Box;
})(Proton);
