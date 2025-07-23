// shared/objects/Dir.js

import factory from '../Factory.js';
import fileSystem from '../../backend/file-system.js';
import { isServer } from '../../backend/side.js'
import EventEmitter from '../EventEmitter.js'


function isServerSide() {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
}

      
const OBJECT_TYPE = 'dir2';

function construct(id) {

  let watcher = null;
  const emitter = new EventEmitter();

  const instance = {
    id,
    async children() {
      return fileSystem.listDir(id);
    },
    async createNew(name, isDir){
      fileSystem.createNew(id, name, isDir);
    },
    destroy(){
      if (watcher){
        console.log("stopping watcher for " + id);
        watcher.stop();
        watcher = null;
      }
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    }
  };
  const emitEvent = (eventName)=>{
    return (...args)=>{
      instance.emit("change");
    };
  }
  if (isServer()){
    watcher = fileSystem.watch(id);
    watcher.on("add", emitEvent("add"));
    watcher.on("addDir", emitEvent("addDir"));
    watcher.on("unlink", emitEvent("unlink"));
    watcher.on("unlinkDir", emitEvent("unlinkDir"));
    watcher.start();
  }

  return instance;
}

/* profiles:
"best_match": find one connection that fits the side spec and wait for the result. if no connection can be found. error
"broadcast": run on any connected object. dont wait
"sync": run on every connected side. dont invoke new connections
*/
factory.register(OBJECT_TYPE, construct, [{
  "method": "children",
  "sides": {"server": true},
  "profile": "best match",
}, {
  "method": "createNew",
  "sides": {"server": true},
  "profile": "best match",
}, {
  "event": "*",
  "profile": "sync"
}]);

export default function create(id) {
    return factory.getOrCreate(OBJECT_TYPE, id)
}

