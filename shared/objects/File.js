// shared/objects/File.js
import factory from '../Factory.js';
import fileSystem from '../../backend/file-system.js'
import EventEmitter from '../EventEmitter.js'
import { isServer } from '../../backend/side.js'

const OBJECT_TYPE = 'file';

const dirtyFiles = new Map(); // keep dirty files alive so they dont lose their content

  

function construct(id) {
  let _buffer = null;         // unsaved edits
  let _lastKnownContent = null;

  let status = {
    dirty: false, // changed by us
    changed: false, // changed on the file system outside of nodemirror
    deleted: false,
  };

  let watcher = null;
  const emitter = new EventEmitter();


  const setDirty = (dirty)=>{
    if (dirty === status.dirty){
      return;
    }
    status.dirty = dirty;
    if (dirty){
      dirtyFiles.set(id, factory.getOrCreate(OBJECT_TYPE, id));
    }else{
      _buffer = null;
      let entry = dirtyFiles.get(id);
      dirtyFiles.delete(id);
      entry.done();
    }
  };


  let statusScheduledLong = null;
  let statusScheduledShort = null;


  const updateStatus = ( newContent )=>{
    // newContent gets passed when there was a filecontent update from the os
    
    if (_buffer){
      // dirty but lets check
      if (newContent){
        status.deleted = false;
        if (_buffer === newContent){
          setDirty(false);
          status.changed = false;
        }else{
          setDirty(true);
          if (_lastKnownContent !== newContent){
            status.changed = true;
            _lastKnownContent = newContent
          }
        }
      }else{
        // no new content
        setDirty(true);
      }
    }else{
      // no buffer
      setDirty(false);
      status.changed = false;
    }
    
  }
  

  const checkStatus = ()=>{
    if (statusScheduledShort){
      clearTimeout(statusScheduledShort);
      statusScheduledShort = null;
    }
    
    statusScheduledLong = setTimeout(doStatusCheck, 500);
    if (!statusScheduledShort){
      statusScheduledShort = setTimeout(doStatusCheck, 5000);
    };
  };


  const doStatusCheck = async ()=>{
    console.log("doing status check " + id);
    if (statusScheduledShort){
      clearTimeout(statusScheduledShort);
      statusScheduledShort = null;
    }
    if (statusScheduledLong){
      clearTimeout(statusScheduledLong);
      statusScheduledLong = null;
    }

    let fileContent = await fileSystem.readFileStr(id);
    updateStatus(fileContent);
    console.log("emmiting change " + id);
    instance.emit("change", status);
    
  };


  const onChange = ()=>{
    console.log("onchange");
    checkStatus();
  }
  if (isServer()){
    watcher = fileSystem.watch(id);
    watcher.on("change", onChange);
    watcher.start();
  }


  const instance = {
    id,
    async getContent() {
      if (_buffer !== null) return _buffer;  // unsaved version
      // This runs on the server side via RPC
      _lastKnownContent = await fileSystem.readFileStr(id);
      return _lastKnownContent;
    },
    async getStatusContent() {
      let ret = {
        content: await getContent()
      };
      ret.status = status;
      return ret;
    },
    async getStatus() {
      return status;
    },
    async reload() {
      
      const fireOnchange = status.dirty;
      setDirty(false);
      let ret = await this.getContent();
      onChange();
      return ret;
    },
    async setContent(newContent) {
      setDirty(true);
      _buffer = newContent; 
      if (_lastKnownContent && _buffer == _lastKnownContent){
        setDirty(false);
      }
      onChange();
    },
    async save() {
      if (!status.dirty){
        return;
      }
      await fileSystem.writeStringToFile(id, _buffer);
      _lastKnownContent = _buffer;
      setDirty(false);
      status.changed = false;
      status.deleted = false;
      onChange();
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    },

    destroy(){
      if (watcher){
        console.log("stopping watcher for " + id);
        watcher.stop();
        watcher = null;
      }
    },

  };

  return instance;
}

factory.register(OBJECT_TYPE, construct, [
  { method: 'getContent', sides: { server: true } },
  { method: 'getStatus',  sides: { server: true } },
  { method: 'reload',     sides: { server: true } },
  { method: 'setContent', sides: { server: true } },
  { method: 'save',       sides: { server: true } },
  {
    "event": "*",
    "profile": "sync"
  }
]);

export default function openFile(id) {
  return factory.getOrCreate(OBJECT_TYPE, id);
}
