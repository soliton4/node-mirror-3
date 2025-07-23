// shared/objects/File.js
import factory from '../Factory.js';
import fileSystem from '../../backend/file-system.js'

const OBJECT_TYPE = 'file';

function construct(id) {
  let _buffer = null;         // unsaved edits

  return {
    id,
    async getContent() {
      if (_buffer !== null) return _buffer;  // unsaved version
      // This runs on the server side via RPC
      return fileSystem.readFileStr(id);
    },
    async reload() {
      console.log(id + " reload");
      _buffer = null;
      return this.getContent();
    },
    async setContent(newContent) {
      console.log(id + " setContent");
      _buffer = newContent;   // keep in memory until saved
    },
    async save() {
      console.log(id + " save");
      if (_buffer === null) return;
      await fileSystem.writeStringToFile(id, _buffer);
      _buffer = null;
    }
  };
}

factory.register(OBJECT_TYPE, construct, [
  { method: 'getContent', sides: { server: true } },
  { method: 'setContent', sides: { server: true } },
  { method: 'save',       sides: { server: true } },
  { method: 'reload',     sides: { server: true } }
]);

export default function openFile(id) {
  return factory.getOrCreate(OBJECT_TYPE, id);
}
