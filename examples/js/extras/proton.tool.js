(function(THREE) {
    Proton.toScreenXY = function() {
        var vec = {};

        return function(position, camera, jqdiv) {
            var pos = position.clone();
            projScreenMat = new THREE.Matrix4();
            projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
            projScreenMat.multiplyVector3(pos);

            vec.x = (pos.x + 1) * jqdiv.width() / 2 + jqdiv.offset().left;
            vec.y = (-pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top;

            return vec;
        }
    }();
})(THREE);
