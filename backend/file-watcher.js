
import chokidar from 'chokidar';
import EventEmitter from '../shared/EventEmitter.js'

export default class FileWatcher {


  
  constructor(path) {
    this.path = path;
    this.watcher = null;
    this._events = new EventEmitter();
  }

  start() {
    if (this.watcher) return;

    this.watcher = chokidar.watch(this.path, {
      persistent: false,
      ignoreInitial: true,
      depth: 0,
    });

    this.watcher
      .on('all', (event, path) => {
        this._events.emit(event, path);
      });

  }

  stop() {
    if (this.watcher) {
      this.watcher.close().then(() => {
        console.log(`Stopped watching ${this.path}`);
        this.watcher = null;
      });
    }
  }

  on(eventName, callback) {
    return this._events.on(eventName, callback);
  }
}

