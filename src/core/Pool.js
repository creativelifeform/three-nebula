import PUID from '../utils/PUID';

export default class Pool {
  constructor() {
    this.cID = 0;
    this.list = {};
  }

  create(obj) {
    this.cID++;

    if (typeof obj == 'function') return new obj();
    else return obj.clone();
  }

  getCount() {
    var count = 0;
    for (var id in this.list) count += this.list[id].length;

    return count++;
  }

  get(obj) {
    var p,
      puid = obj.__puid || PUID.id(obj);
    if (this.list[puid] && this.list[puid].length > 0)
      p = this.list[puid].pop();
    else p = this.create(obj);

    p.__puid = obj.__puid || puid;

    return p;
  }

  expire(obj) {
    return this._getList(obj.__puid).push(obj);
  }

  destroy() {
    for (var id in this.list) {
      this.list[id].length = 0;
      delete this.list[id];
    }
  }

  _getList(uid) {
    uid = uid || 'default';
    if (!this.list[uid]) this.list[uid] = [];

    return this.list[uid];
  }
}
