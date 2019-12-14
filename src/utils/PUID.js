export default {
  _id: 0,
  _uids: {},
  getNewId: function() {
    return `PUID_${this._id++}`;
  },
  id: function(functionOrObject) {
    for (let id in this._uids) {
      if (this._uids[id] == functionOrObject) {
        return id;
      }
    }

    const newId = this.getNewId();

    this._uids[newId] = functionOrObject;

    return newId;
  },
};
