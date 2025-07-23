// backend/Connection.js
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from './EventEmitter.js'
import { isServer } from '../backend/side.js'
import { validatePassword } from '../backend/auth.js';


export default class Connection {
  constructor(ws, isAuthenticated) {
    if (!ws._clientId){
        ws._clientId = uuidv4();
    }

    this.ws = ws;
    this.isAuthenticated = isAuthenticated;
    this._events = new EventEmitter();

    this.remoteKeys = new Set();
    this.objects = new Map();

    const onClose = () => {
      this._events.emit("close");
    };
    
    const onMessage = isServer() ? (msg) => {

      let data;
      try {
        data = JSON.parse(msg);
      } catch (err) {
        console.log("Invalid JSON received from client:", msg);
        return;
      }

      if (this.isAuthenticated){
        this._events.emit("message", data);
        return;
      }

      if (data.type === 'auth') {
        if (validatePassword(data.payload.password)) {
          this.isAuthenticated = true;
          ws.send(JSON.stringify({ type: 'auth_success' }));
        } else {
          ws.send(JSON.stringify({ type: 'auth_failed' }));
        }
        return;
      }
    } : (msg) => {
      // client version
      try {
        const data = JSON.parse(msg.data);
        this._events.emit("message", data);
      } catch (err) {
        console.log("Invalid JSON received from client:", msg);
        return;
      }

    };

    if (typeof ws.on === 'function') {
      // Node.js ws
      ws.on('close', onClose);
      ws.on('message', onMessage);
    } else if (typeof ws.addEventListener === 'function') {
      // Browser WebSocket
      ws.addEventListener('close', onClose);
      ws.addEventListener('message', onMessage);
    }
    if (isServer()){
      if (this.isAuthenticated) {
        ws.send(JSON.stringify({ type: 'auth_success' }));
      } else {
        ws.send(JSON.stringify({ type: 'need_auth' }));
      }
    }
    
  }

  send(msg) {
    this.ws.send(msg);
  }


  /**
   * Register an event listener
   */
  on(eventName, callback) {
    return this._events.on(eventName, callback);
  }

}
