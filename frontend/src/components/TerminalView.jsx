// frontend/src/components/TerminalView.jsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css'; // import xterm styles

import ServerTerminalInstance from '../../../shared/objects/terminal/Instance.js'
import ServerTerminalView from '../../../shared/objects/terminal/View.js'

const TerminalView = forwardRef(({ id }, ref) => {
  const containerRef = useRef(null);
  const terminalInstanceRef = useRef(null); // store Terminal instance
  const xtermRef = useRef(null); // store xterm instance
  const fitRef = useRef(null);      // store FitAddon instance

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (xtermRef){
          if (xtermRef.current){
            if (xtermRef.current.focus){
              xtermRef.current.focus();
            }
          }
      }
    }
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const xterm = new Terminal({scrollback: 10000});
    const fitAddon = new FitAddon();
    const terminalInstance = ServerTerminalInstance(id);
    terminalInstanceRef.current = terminalInstance;
    let viewer = null;
    xtermRef.current = xterm;
    fitRef.current = fitAddon;

    xterm.loadAddon(fitAddon);
    xterm.open(containerRef.current);

    const loadBuffer = async ()=>{
      const buffer = await terminalInstance.getBuffer();
      if (!buffer || !xtermRef.current) return;

      const xterm = xtermRef.current;

    
      // Reset terminal before writing
      xterm.reset();
      xterm.resize(buffer.size.cols, buffer.size.rows);

      xterm.write(buffer.buffer);
    };
    loadBuffer();


    const handleResize = () => {
      const fit = fitRef.current;
      const term = xtermRef.current;
      const instance = terminalInstanceRef.current;
      if (fit && term && viewer) {
        let dims = fit.proposeDimensions();
        viewer.resize(dims.cols, dims.rows);
      }
    };


    const initViewer = async ()=>{
      let viewerId = await terminalInstance.getViewer();
      if (!terminalInstanceRef.current){
        return;
      };
      viewer = ServerTerminalView(id + ":" + viewerId);
      handleResize();
    };

    initViewer();



    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Receive backend data and print to terminal
    const unsubscribe = terminalInstance.on('data', (text) => {
      xterm.write(text);
    });
    const onResizeSubscribtion = terminalInstance.on("resize", (cols, rows)=>{
      // server side triggered resize
      xterm.resize(cols, rows);
    });

    // Send user input to backend
    const xtermDataListener = xterm.onData((input) => {
      terminalInstance.input(input);
    });



    // Cleanup
    return () => {
      //events
      unsubscribe();
      onResizeSubscribtion();
      xtermDataListener.dispose();

      // js
      resizeObserver.disconnect();
      xterm.dispose();

      // free synced object
      terminalInstance.done();
      if (viewer){
        viewer.done();
      }
      // mark local environment as invalid
      terminalInstanceRef.current = null;
    };
  }, [id]);


  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        padding: '0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >

    </div>
  );
});

export default TerminalView;
