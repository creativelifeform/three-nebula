export default {
  _id: 0,
  _uids: {},
  id: function(functionOrObject) {
    for (let id in this._uids) {
      if (this._uids[id] == functionOrObject) {
        return id;
      }
    }

    const nid = 'PUID_' + this._id++;

    this._uids[nid] = functionOrObject;

    return nid;
  }
};
