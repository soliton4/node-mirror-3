import { side } from "../backend/side.js"

function keyFromIds(type, id){
    return `${type}:${id}`;
}

class Factory {
  constructor() {
    this.objects = new Map(); // key: `${type}:${id}` → instance
    
    this.objectDefinitions = new Map(); // type → constructor
    this.connectionManager = null;
    
    this.nextReplyId = 1;
    this.pendingReplies = new Map();
  }

  init(connectionManager) {
    this.connectionManager = connectionManager;

    connectionManager.on('connect', (con) => {
      con.on("message", (msg)=>{
        this.handleMessage(con, msg);
      });
      con.on("close", (msg)=>{
        console.log("close");
        for (const obj of con.objects.values()) {
          // we know there is a done function
          obj.done();
        }
      });
    });
  }

  register(type, constructorFn, overrides) {
    this.objectDefinitions.set(type, {
      constructor: constructorFn,
      overrides: overrides
    });
  }

  getInstanceNoTracking(objectType, id) {
    const key = keyFromIds(objectType, id);
    if (this.objects.has(key)) {
      return this.objects.get(key).instance;
    }
  }

  getOrCreate(objectType, id, remoteConnection) {
    const key = keyFromIds(objectType, id);
    const definition = this.objectDefinitions.get(objectType);
    if (!definition) throw new Error(`no definition for type "${objectType}"`);

    if (remoteConnection && remoteConnection.objects.has(key)){
      return remoteConnection.objects.get(key);
    };
    
    let obj;
    let objEntry;
    if (this.objects.has(key)) {
      objEntry = this.objects.get(key);
      obj = objEntry.instance;
    }else{
      const ctor = definition.constructor;
      if (!ctor) throw new Error(`Constructor not registered for type "${objectType}"`);
      console.log("creating: " + key);
      obj = ctor(id);
      objEntry = { instance: obj, trackers: new Set() };
      this.objects.set(key, objEntry);
    }
    // allows us to override specific functions for each time the object gets returned
    const wrapObj = Object.create(obj);

    const nextReplyId = ()=>{
      this.nextReplyId = this.nextReplyId + 1;
      return this.nextReplyId;
    };
    const createOverrideMethod = (objectType, id, method, broadcast, wait, error, runlocal)=>{
      if (broadcast){
        wait = false;
      }
      
      const sendWithThisCon = (c, parameters)=>{
        let payload = {"type": objectType, "id": id, "method": method, "parameters": parameters};
        if (wait){
          payload.callId = nextReplyId();
        };
        c.send(JSON.stringify({"type": "execute", "payload": payload}));
        if (wait){
          return this.waitForReply(c, payload.callId);
        };
      };
      return async(...parameters)=>{
        // making sure the function is called locally exactly once
        const returnHook = (ret)=>{
          if (runlocal){
            // obj is our local object. wraperObj has a different version of the method
            return obj[method](...parameters);
          }
          return ret;
        };
        for (const con of this.connectionManager.connections.values()) {
          if (con.objects.has(key)) {
            if (wait){
              return returnHook(sendWithThisCon(con, parameters));
            }else{
              sendWithThisCon(con, parameters);
            }
            if (!broadcast){
              return returnHook();
            }
          }
        }
        if (broadcast){
          return returnHook();
        }
        if (this.connectionManager.connections.size > 0) {
          const firstConnection = this.connectionManager.connections.values().next().value;
          firstConnection.remoteKeys.add(key);
          return returnHook(sendWithThisCon(firstConnection, parameters));
        }
        if (runlocal){
          return returnHook();
        }
        if (error){
          throw new Error("no connection available");
        }
      };
    };

    let broadcastEvents = {};
    let hasBroadcastEvents = false;
    const prepareEvents = ()=>{
      if (!hasBroadcastEvents){
        return;
      };
      const sendWithThisCon = (c, payload)=>{
        c.send(JSON.stringify(payload));
      };
      obj["_local_emit"] = obj["emit"]
      obj["emit"] = (event, ...args)=>{
        if (obj["_local_emit"]){
          obj["_local_emit"](event, ...args);
        };
        if (broadcastEvents["*"] || broadcastEvents[event]){
          for (const con of this.connectionManager.connections.values()) {
            if (con.objects.has(key)) {
              con.send(JSON.stringify({
                "type": "event", 
                "payload": {"type": objectType, "id": id, "event": event, "args": args}
              }));
            }
          }
        }
      }
    };

    if (definition.overrides){
      for (const o of definition.overrides){
        let remote = !(o.sides && o.sides[side]);
        if (remote){
          const method = o["method"];
          const event = o["event"];
          let broadcast = false;
          let wait = true;
          let runLocal = false;
          let error = true;
          if (o["profile"] === "best match"){
            broadcast = false;
            wait = true;
            error = true;
          } else if (o["profile"] === "broadcast"){
            broadcast = true;
            wait = false;
            error = false;
          } else if (o["profile"] === "sync"){
            broadcast = true;
            wait = false;
            error = false;
            runLocal = true;
          }

          if (method){
            wrapObj[method] = createOverrideMethod(objectType, id, method, broadcast, wait, error, runLocal);
          }
          if (event){
            if (broadcast){
              hasBroadcastEvents = true;
              broadcastEvents[event] = true;
            }
          }

        }
      }
      if (hasBroadcastEvents){
        prepareEvents();
      }
    }
    objEntry.trackers.add(wrapObj);
    wrapObj["done"] = ()=>{
      objEntry.trackers.delete(wrapObj);
      if (objEntry.trackers.size === 0){
        if (objEntry.instance.destroy){
          objEntry.instance.destroy();
        };
        this.objects.delete(key);
        console.log("unloading: " + key);
        wrapObj["done"] = ()=>{};
        Object.setPrototypeOf(wrapObj, null);
        // tell all our remotes that we are no longer using this object
        for (const con of this.connectionManager.connections.values()) {
          if (con.remoteKeys.has(key)){
            con.remoteKeys.delete(key);
            console.log("sending free " + key);
            con.send(JSON.stringify({"type": "free", "payload": {"type": objectType, "id": id } }));
          };
        }
      }
    };
    if (remoteConnection){
      remoteConnection.objects.set(key, wrapObj);
    }

    return wrapObj;
  }

  async handleMessage(connection, msg) {
    try {
      const { type, payload } = msg;

      if (type == 'execute'){
        await this.handleExecuteMsg(connection, payload);
      }
      if (type == 'reply'){
        await this.handleReplyMsg(connection, payload);
      }
      if (type == 'event'){
        this.handleEventMsg(connection, payload);
      }
      if (type == 'free'){
        this.handleFreeMsg(connection, payload);
      }


    } catch (err) {
      console.error('Factory RPC error:', err);
    }
  }

  handleEventMsg(connection, msg) {
    const { type, id, event, args } = msg;
    const key = keyFromIds(type, id);
    let instance = this.getInstanceNoTracking(type, id);
    if (!instance){
      return;
    };

    if (instance["_local_emit"]){
      instance["_local_emit"](event, ...args);
    }else if (instance["emit"]){
      instance["emit"](event, ...args);
    }

  }

  handleFreeMsg(connection, msg) {
    const { type, id } = msg;
    const key = keyFromIds(type, id);
    if (connection.objects.has(key)){
      const obj = connection.objects.get(key);
      connection.objects.delete(key);
      obj.done();
    }
  }

  async handleExecuteMsg(connection, msg) {
    const { type, id, method, parameters, callId } = msg;
    let instance = this.getOrCreate(type, id, connection);

    try {
      const result = await instance[method](...parameters);
      if (callId){
        connection.send(JSON.stringify({ type: "reply", payload: { callId, result } }));
      };
    } catch (err) {
      if (callId){
        connection.send(JSON.stringify({ type: "reply", payload: { callId, error: err.message || String(err) } }));
      };
    }

  }


  async handleReplyMsg(connection, msg) {
    const { result, callId } = msg;

    const pending = this.pendingReplies.get(callId);
    if (!pending) {
      console.warn(`No pending reply found for callId ${callId}`);
      return;
    }
    const {resolve, reject} = pending;
    this.pendingReplies.delete(callId);

    if (msg.error){
        reject(new Error(msg.error));
        return;
    }

    resolve(result);
  }
  async waitForReply(connection, callId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingReplies.has(callId)) {
          this.pendingReplies.delete(callId);
          reject(new Error(`Timeout waiting for reply to callId ${callId}`));
        }
      }, 10000);

      this.pendingReplies.set(callId, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      });
    });
  }

}

// Create the one and only instance here
const factory = new Factory();

// Export the singleton
export default factory;
