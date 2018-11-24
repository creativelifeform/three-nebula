/*
 * EventDispatcher
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 **/

export default class EventDispatcher {
  constructor() {
    this.listeners = null;
  }

  set listeners(listeners) {
    this._listeners = listeners;
  }

  get listeners() {
    return this._listeners;
  }

  addEventListener(type, listener) {
    if (!this.listeners) {
      this.listeners = {};
    } else {
      this.removeEventListener(type, listener);
    }

    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);

    return listener;
  }

  removeEventListener(type, listener) {
    if (!this.listeners) return;
    if (!this.listeners[type]) return;

    var arr = this.listeners[type];

    for (var i = 0, l = arr.length; i < l; i++) {
      if (arr[i] == listener) {
        if (l == 1) {
          delete this.listeners[type];
        }
        // allows for faster checks.
        else {
          arr.splice(i, 1);
        }
        break;
      }
    }
  }

  removeAllEventListeners(type) {
    if (!type) this.listeners = null;
    else if (this.listeners) delete this.listeners[type];
  }

  dispatchEvent(eventName, eventTarget) {
    var ret = false,
      listeners = this.listeners;

    if (eventName && listeners) {
      var arr = listeners[eventName];

      if (!arr) return ret;

      arr = arr.slice();
      // to avoid issues with items being removed or added during the dispatch

      var handler,
        i = arr.length;

      while (i--) {
        handler = arr[i];

        ret = ret || handler(eventTarget);
      }
    }

    return !!ret;
  }

  hasEventListener(type) {
    var listeners = this.listeners;

    return !!(listeners && listeners[type]);
  }
}
