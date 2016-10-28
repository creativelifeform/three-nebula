(function(Proton, undefined) {
    var PUID = PUID || {
        _id: 0,
        _uids: {},
        id: function(obj) {
            for (var id in this._uids) {
                if (this._uids[id] == obj) return id;
            }

            var nid = "PUID_" + (this._id++);
            this._uids[nid] = obj;
            return nid;
        },

        hash: function(str) {
            return;
        }
    }

    Proton.PUID = PUID;
})(Proton);
