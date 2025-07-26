// shared/objects/File.js
import factory from '../Factory.js';
import EventEmitter from '../EventEmitter.js'
import { isServer } from '../../backend/side.js'
import TerminalInstance from './terminal/Instance.js'

const OBJECT_TYPE = 'terminal';


function construct(id) {

  const emitter = new EventEmitter();
  const terminals = new Map();
  let terminalCounter = 0;
  
  const instance = {
    async createTerminal() {
      const nextId = `term-${terminalCounter++}`;
      const term = TerminalInstance(nextId);
      terminals.set(nextId, term);
      term.startup();
      instance.emit("change"); // optional: notify listeners
      this.emit("change");
      return nextId;
    },
    async listTerminals() {
      return Array.from(terminals.keys());
    },
    async closeTerminal(terminalId) {
      if (terminals.has(terminalId)){
        let term = terminals.get(teriminalId);
        terminals.delete(terminalId);
        term.close();
        term.done();
        this.emit("change");
      }
      return;
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    },

    destroy(){
    },

  };

  return instance;
}

factory.register(OBJECT_TYPE, construct, [
  { method: 'createTerminal', sides: { server: true } },
  { method: 'listTerminals',  sides: { server: true } },
  { method: 'closeTerminal',  sides: { server: true } },
  {
    "event": "*",
    "profile": "sync"
  }
]);

export default function openFile(id) {
  return factory.getOrCreate(OBJECT_TYPE, id);
}
