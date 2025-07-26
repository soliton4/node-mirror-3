import pty from 'node-pty';
import EventEmitter from '../shared/EventEmitter.js'

import pkg from '@xterm/headless';
const { Terminal } = pkg;


const MAX_BUFFER_LINES = 5000;

export function createTerminal() {
  const shell = process.env.SHELL || 'bash';

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
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
    cols: 80,
    rows: 24,
    scrollback: MAX_BUFFER_LINES,
  });

  const unsubscribe = emitter.on("data", (data)=>{
    headless.write(data);
  });

  return {
    input(data) {
      ptyProcess.write(data);
    },
    resize(cols, rows) {
      headless.resize(cols, rows);
      ptyProcess.resize(cols, rows);
    },
    on(...args) {
      return emitter.on(...args);
    },
    
    getBuffer() {
      const buffer = headless.buffer.active;
      const lines = [];

      for (let i = 0; i < buffer.length; i++) {
        const line = buffer.getLine(i);
        if (!line) continue;

        const text = line.translateToString(true); // true = trim trailing whitespace
        lines.push(text);
      }

      return {
        lines,
        cursor: {
          x: buffer.cursorX,
          y: buffer.cursorY,
        },
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
