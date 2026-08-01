/*
 * EventDispatcher
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 **/

export type Listener = (eventTarget?: unknown) => unknown;
type ListenerMap = Record<string, Listener[]>;

export default class EventDispatcher {
  _listeners: ListenerMap | null;

  constructor() {
    this.listeners = null;
  }

  set listeners(listeners: ListenerMap | null) {
    this._listeners = listeners;
  }

  get listeners(): ListenerMap | null {
    return this._listeners;
  }

  addEventListener(type: string, listener: Listener): Listener {
    if (!this.listeners) {
      this.listeners = {};
    } else {
      this.removeEventListener(type, listener);
    }

    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);

    return listener;
  }

  removeEventListener(type: string, listener: Listener): void {
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

  removeAllEventListeners(type?: string): void {
    if (!type) this.listeners = null;
    else if (this.listeners) delete this.listeners[type];
  }

  dispatchEvent(eventName: string, eventTarget?: unknown): boolean {
    var ret: unknown = false,
      listeners = this.listeners;

    if (eventName && listeners) {
      var arr = listeners[eventName];

      if (!arr) return !!ret;

      arr = arr.slice(); //Should use a copy into a temporary here instead...
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

  hasEventListener(type: string): boolean {
    var listeners = this.listeners;

    return !!(listeners && listeners[type]);
  }
}
