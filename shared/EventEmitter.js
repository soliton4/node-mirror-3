// utils/EventEmitter.js
export default class EventEmitter {
  constructor() {
    this._listeners = new Map(); // Map<eventName, Set<callback>>
  }

  /**
   * Register a listener. Returns an unsubscribe function.
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    const set = this._listeners.get(event);
    set.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Remove a specific listener.
   */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all listeners.
   */
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set) {
      // Copy to avoid mutation during iteration
      for (const callback of [...set]) {
        try {
          callback(...args);
        } catch (err) {
          console.error(`Error in listener for "${event}":`, err);
        }
      }
    }
  }

  /**
   * Clear all listeners (or just for one event).
   */
  clear(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}
