// shared/objects/File.js
import factory from '../../Factory.js';
import EventEmitter from '../../EventEmitter.js'
import { isServer } from '../../../backend/side.js'
import TerminalInstance from './Instance.js'

const OBJECT_TYPE = 'terminal-view';


function construct(id) {

  const emitter = new EventEmitter();
  const instanceid = id.split(":")[0];
  const terminalInstance = isServer() ? TerminalInstance(instanceid) : null;

  const sizeConstraint = {};
  
  const instance = {
    startup() {
      if (isServer()){
        terminalObj = terminal.createTerminal();
        terminalObj.on("data", (data) => {
          instance.emit("data", data);
        });
      }
    },
    async resize(cols, rows){
      if (terminalInstance){
        sizeConstraint.rows = rows;
        sizeConstraint.cols = cols;
        terminalInstance.applyConstraint(id, sizeConstraint);
      }
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    },

    destroy(){
      if (terminalInstance){
        terminalInstance.resetConstraint(id);
        terminalInstance.done();
      }
    },

  };

  return instance;
}

factory.register(OBJECT_TYPE, construct, [
  { method: 'resize', sides: { server: true } },
  {
    "event": "*",
    "profile": "sync"
  }
]);

export default function TerminalView(id) {
  return factory.getOrCreate(OBJECT_TYPE, id);
}
