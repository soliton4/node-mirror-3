import pty from 'node-pty';
import EventEmitter from '../shared/EventEmitter.js'

import pkg from '@xterm/headless';
const { Terminal } = pkg;

import { SerializeAddon } from '@xterm/addon-serialize';


const MAX_BUFFER_LINES = 5000;

export function createTerminal() {
  const shell = process.env.SHELL || 'bash';
  
  let size = {
    rows: 24,
    cols: 80
  };

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: size.cols,
    rows: size.rows,
    cwd: process.cwd(),
    env: process.env,
  });


  const emitter = new EventEmitter();

  ptyProcess.onData((data) => {
    emitter.emit("data", data);
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    emitter.emit("exit", { exitCode, signal });
  });

  const headless = new Terminal({
    allowProposedApi: true,
    cols: size.cols,
    rows: size.rows,
    scrollback: MAX_BUFFER_LINES,
  });
  const serializeAddon = new SerializeAddon();
  headless.loadAddon(serializeAddon);


  const unsubscribe = emitter.on("data", (data)=>{
    headless.write(data);
  });

  return {
    input(data) {
      ptyProcess.write(data);
    },
    resize(cols, rows) {
      size.cols = cols;
      size.rows = rows;
      headless.resize(size.cols, size.rows);
      ptyProcess.resize(size.cols, size.rows);
    },
    on(...args) {
      return emitter.on(...args);
    },
    
    getBuffer() {
      const serializedState = serializeAddon.serialize();
    
      return {
        size, 
        buffer: serializedState
      };
    },



    
    close() {
      unsubscribe();
      ptyProcess.kill();
      headless.destroy();
    },
  };
}

export default {createTerminal};
