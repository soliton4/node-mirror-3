// shared/objects/Dir.js

import factory from '../Factory.js';
import fileSystem from '../../backend/file-system.js';


function isServerSide() {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
}

      
const OBJECT_TYPE = 'dir2';

function construct(id) {

  const instance = {
    id,
    async children() {
      return fileSystem.listDir(id);
    }
  };

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
  "event": "*",
  "profile": "sync"
}]);

export default function create(id) {
    return factory.getOrCreate(OBJECT_TYPE, id)
}

