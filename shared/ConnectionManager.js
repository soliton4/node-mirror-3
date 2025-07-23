// backend/ConnectionManager.js
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from './EventEmitter.js'

import Connection from './Connection.js';

class ConnectionManager {
  constructor() {
    if (ConnectionManager.instance) return ConnectionManager.instance;

    this._events = new EventEmitter();

    this.connections = new Map(); // key: clientId, value: ws

    ConnectionManager.instance = this;
  }

  /**
   * Register an event listener
   */
  on(eventName, callback) {
    return this._events.on(eventName, callback);
  }

  /**
   * Add a new WebSocket connection and emit event
   */
  add(ws, isAuthenticated) {
    if (!ws._clientId){
        ws._clientId = uuidv4();
    }
    if (this.connections.has(ws._clientId)) {
      return
    }

    let con = new Connection(ws, isAuthenticated);
    this.connections.set(ws._clientId, con);
    this._events.emit('connect', con);

    con.on('close', ()=>{
      this.remove(ws._clientId);
    });
  }

  remove(clientId) {
    this.connections.delete(clientId);
    this._events.emit('close', clientId);
  }

}

const connectionManager = new ConnectionManager();

export default connectionManager;
