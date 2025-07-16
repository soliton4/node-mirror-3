function keyFromIds(type, id){
    return `${type}:${id}`;
}

class Factory {
  constructor() {
    this.objects = new Map(); // key: `${type}:${id}` → instance
    this.objectDefinitions = new Map(); // type → constructor
    this.connectionManager = null;
    this.connections = new Map()
    this.nextReplyId = 1;
    this.pendingReplies = new Map();
  }

  init(connectionManager, side) {
    this.connectionManager = connectionManager;
    this.side = side;

    connectionManager.on('newConnection', (ws) => {

      let entry = {
        "ws": ws,
        "objects": new Map()
      }
      const handler = (msgOrEvent) => {
        const raw = ws._isNode ? msgOrEvent : msgOrEvent.data;
        this.handleMessage(entry, raw);
      };
      const disconnectHandler = () => {
        this.connections.delete(ws._clientId);
      }

      if (ws._isNode) {
        ws.on('message', handler);
        ws.on('disconnect', disconnectHandler);
      } else {
        ws.addEventListener('message', handler);
        ws.addEventListener('disconnect', disconnectHandler);
      }

      this.connections.set(ws._clientId, entry);

    });


    connectionManager.on('disconnect', (id) => {
      // Optional cleanup: remove associated state if needed
      console.log(`Disconnected: ${id}`);
    });
  }

  register(type, constructorFn, overrides) {
    this.objectDefinitions.set(type, {
      constructor: constructorFn,
      overrides: overrides
    });
  }

  getOrCreate(objectType, id) {
    const key = keyFromIds(objectType, id);
    if (!this.objects.has(key)) {
      const definition = this.objectDefinitions.get(objectType);
      if (!definition) throw new Error(`no definition for type "${objectType}"`);
      const ctor = definition.constructor;
      if (!ctor) throw new Error(`Constructor not registered for type "${objectType}"`);
      const obj = ctor(id);

      if (definition.overrides){
        for (let i = 0; i < definition.overrides.length; ++i) {
          let o = definition.overrides[i];
          if (!o.sides[this.side]){
            const method = o["method"];
            obj[method] = async (...parameters) => {
              let cons = Array.from(this.connections.entries());
              let executed = false
              this.nextReplyId = this.nextReplyId + 1;
              let payload = {"type": "execute", "payload": {"type": objectType, "id": id, "method": method, "parameters": parameters, callId: this.nextReplyId}};
              for (let c = 0; c < cons.length; ++c){
                const [_, connEntry] = cons[c];
                if (connEntry.objects.has(key)) {
                  connEntry.ws.send(JSON.stringify(payload));
                  return this.waitForReply(connEntry, this.nextReplyId);
                }
              }
              if (cons.length > 0){
                const [_, connEntry] = cons[0];
                connEntry.ws.send(JSON.stringify(payload));
                return this.waitForReply(connEntry, this.nextReplyId);
              }
              throw new Error("no connection available");

            }
          }
        }
      }

      this.objects.set(key, obj);
    }
    return this.objects.get(key);
  }

  async handleMessage(connectionEntry, msg) {
    try {
      const { type, payload } = JSON.parse(msg);

      if (type == 'execute'){
        await this.handleExecuteMsg(connectionEntry, payload);
      }
      if (type == 'reply'){
        await this.handleReplyMsg(connectionEntry, payload);
      }


    } catch (err) {
      console.error('Factory RPC error:', err);
    }
  }

  async handleExecuteMsg(connectionEntry, msg) {
    const { type, id, method, parameters, callId } = msg;
    const key = keyFromIds(type, id);
    let instance = connectionEntry.objects[key];
    if (!instance){
      instance = this.getOrCreate(type, id);
      connectionEntry.objects.set(key, instance);
    }


    try {
      const result = await instance[method](...parameters);
      connectionEntry.ws.send(JSON.stringify({ type: "reply", payload: { callId, result } }));
    } catch (err) {
      connectionEntry.ws.send(JSON.stringify({ type: "reply", payload: { callId, error: err.message || String(err) } }));
    }

  }


  async handleReplyMsg(connectionEntry, msg) {
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
  async waitForReply(connectionEntry, callId) {
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
