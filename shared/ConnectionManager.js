// backend/ConnectionManager.js
import { v4 as uuidv4 } from 'uuid';

class ConnectionManager {
  constructor() {
    if (ConnectionManager.instance) return ConnectionManager.instance;

    this.connections = new Map(); // key: clientId, value: ws
    this.listeners = new Map();   // event system

    ConnectionManager.instance = this;
  }

  /**
   * Register an event listener
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Internal: trigger all listeners for a given event
   */
  _emit(eventName, ...args) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach(cb => cb(...args));
    }
  }

  /**
   * Add a new WebSocket connection and emit event
   */
  add(ws) {
    if (!ws._clientId){
        ws._clientId = uuidv4();
    }
    if (this.connections.has(ws._clientId)) {
      return
    }

    // Determine and store environment
    ws._isNode = typeof ws.on === 'function';

    this.connections.set(ws._clientId, ws);
    this._bindEvents(ws);
    this._emit('newConnection', ws);
  }

  _bindEvents(ws) {
    const onClose = () => {
      this.remove(ws._clientId);
    };

    if (typeof ws.on === 'function') {
      // Node.js ws
      ws.on('close', onClose);
    } else if (typeof ws.addEventListener === 'function') {
      // Browser WebSocket
      ws.addEventListener('close', onClose);
    }
  }

  remove(clientId) {
    this.connections.delete(clientId);
    this._emit('disconnect', clientId);
  }

}

const connectionManater = new ConnectionManager();

export default connectionManater;
