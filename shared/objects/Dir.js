// shared/objects/Dir.js

import factory from '../Factory.js';
import fileSystem from '../../backend/file-system.js';


function isServerSide() {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
}


const OBJECT_TYPE = 'dir';

function construct(id) {
  const instance = {
    id,
    async listFiles(location) {
      // location is already a virtual path like '/backend' or '/'
      return fileSystem.listDir(location);
    }
  };

  return instance;
}

factory.register(OBJECT_TYPE, construct, [{
    "method": "listFiles",
    "sides": {"server": true}
}]);

export default function create(id) {
    return factory.getOrCreate(OBJECT_TYPE, id)
}

