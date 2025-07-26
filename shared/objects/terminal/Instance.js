// shared/objects/File.js
import factory from '../../Factory.js';
import EventEmitter from '../../EventEmitter.js'
import { isServer } from '../../../backend/side.js'
import terminal from '../../../backend/terminal.js'

const OBJECT_TYPE = 'terminal-instance';


function construct(id) {

  const emitter = new EventEmitter();

  let terminalObj = null;
  let viewcounter = 0;

  const constraints = new Map(); // viewerId -> { rows, cols }

  let lastApplied = { rows: null, cols: null };

  function maybeResize() {
    if (constraints.size === 0 || !terminalObj) return;
  
    const rows = Math.min(...[...constraints.values()].map(c => c.rows));
    const cols = Math.min(...[...constraints.values()].map(c => c.cols));
  
    if (rows !== lastApplied.rows || cols !== lastApplied.cols) {
      instance.emit("resize", cols, rows); // let clients adjust
      console.log("resize:");
      console.log({rows, cols});
      terminalObj.resize(cols, rows);
      lastApplied = { rows, cols };
    }
  }


  
  const instance = {
    startup() {
      if (isServer()){
        terminalObj = terminal.createTerminal();
        terminalObj.on("data", (data) => {
          instance.emit("data", data);
        });
      }
    },
    async input(data){
      if (terminalObj) {
        terminalObj.input(data);
      }
    },
    async getViewer(){
      viewcounter += 1;
      return viewcounter;
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    },

    applyConstraint(viewerId, constraint) {
      constraints.set(viewerId, constraint);
      maybeResize();
    },
    
    resetConstraint(viewerId) {
      constraints.delete(viewerId);
      maybeResize();
    },


    destroy(){
      if (terminalObj){
        terminalObj.close();
      }
    },

  };

  return instance;
}

factory.register(OBJECT_TYPE, construct, [
  { method: 'input',     sides: { server: true } },
  { method: 'getViewer', sides: { server: true } },
  {
    "event": "*",
    "profile": "sync"
  }
]);

export default function TerminalInstance(id) {
  return factory.getOrCreate(OBJECT_TYPE, id);
}
