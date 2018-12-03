import PUID from '../utils/PUID';

export default class Pool {
  constructor() {
    this.cID = 0;
    this.list = {};
  }

  /**
   * Attempts to create a new object either by creating a new instance or calling its
   * clone method.
   *
   * NOTE If unable to create an object this method will simply return undefined
   * it should possibly throw an error in this case.
   *
   * @param {object} o - The object to create
   * @return {object|undefined}
   */
  create(o) {
    if (!this.canCreateNewObject(o)) {
      // TODO throw an error here
      return;
    }

    this.cID++;

    if (this.canInstantiateObject(o)) {
      return new o();
    }

    if (this.canCloneObject(o)) {
      return o.clone();
    }
  }

  /**
   * Determines if the object is able to be instantiated or not.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canInstantiateObject(object) {
    return typeof object === 'function';
  }

  /**
   * Determines if the object is able to be cloned or not.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canCloneObject(object) {
    return object.clone && typeof object.clone === 'function';
  }

  /**
   * Determines if a new object is able to be created.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canCreateNewObject(object) {
    return this.canInstantiateObject(object) || this.canCloneObject(object)
      ? true
      : false;
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
