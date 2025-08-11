// shared/objects/Dir.js

import factory from '../Factory.js';
import { isServer } from '../../backend/side.js'
import EventEmitter from '../EventEmitter.js'
import { chat } from '../../backend/ai/openai.js'

      
const OBJECT_TYPE = 'aimessage';

function construct(id) {

  const emitter = new EventEmitter();

  const instance = {
    id,
    async run(messages) {
      console.log("run");
      console.log(messages);
      if (!isServer()){
        return {
          content: [
            { type: 'text', text: 'This is a dummy AI response. Hello from the client side' }
          ]
        };
      }
      let ret = await chat({messages});
      return ret;
    },
    
    destroy(){
      
    },
    on(eventName, callback) {
      return emitter.on(eventName, callback);
    },
    emit(event, ...args){
      emitter.emit(event, ...args);
    }
  };
  

  return instance;
}


factory.register(OBJECT_TYPE, construct, [{
  "method": "run",
  "sides": {"server": true},
  "profile": "best match",
}, {
  "event": "*",
  "profile": "sync"
}]);

export default function create(id) {
    return factory.getOrCreate(OBJECT_TYPE, id)
}

