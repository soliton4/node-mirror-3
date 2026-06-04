import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import File from '../../../shared/objects/File';
import DoubleTimeout from '../../../shared/DoubleTimeout.js';
import { useConfig } from '../ConfigContext';

import IVEditorImpl from './IVEditorImpl';


const IVEditor = forwardRef(({ id, setToolbarExtras }, ref) => {

  const fileRef = useRef(null); // the file object
  const localContent = useRef("");


  const transmit = async () => {
    if (transmittingContent.current !== null){
      transmitTimeout.current.trigger();
      return;
    };
    transmittingContent.current = localContent.current;
    if (fileRef.current){
      await fileRef.current.setContent(transmittingContent.current);
    }
    lastTransmittedContent.current = transmittingContent.current;
    transmittingContent.current = null;
  }
  const transmitTimeout = useRef(DoubleTimeout(transmit, 5000, 1000));

  // editor changed
  const onChange = (text) => {

    if (text === localContent.current){
      return;
    }
    localContent.current = text;
    transmitTimeout.current.trigger();
  };


  const implRef = useRef(null);

  const updateEditor = (newText) => {
    localContent.current = newText;
    implRef.current?.setContent(newText);
  };


  // this is the implementation of data arriving from remote
  const changeFromServer = (text)=>{

    //updateEditor(text);

  };

  

  const onServerChange = async (status)=>{
    // file changed on the server
    if (fileRef.current){
      const content = await fileRef.current?.getContent();
      if (content != null) {
        changeFromServer(content);
      }
    };
  };

  useEffect(() => {
    const file = File(id);
    fileRef.current = file;
    const unsubscribe = file.on("change", onServerChange);

    const fetch = async () => {
      const v = await file.getContent();

      changeFromServer(v);
    };
    fetch();


    return () => {
      unsubscribe();
      file.done(); // <-- will be called when the component unmounts or dependencies change
      fileRef.current = null;
    };
  }, [id]);



  const onSave = () => {
    fileRef.current?.save();
  };

  return <div
    ref={ref}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}
    >
      <IVEditorImpl 
        ref={implRef}
        style={{ height: '100%', overflow: 'auto' }}
        height="100%"
        maxHeight="100%"
        onChange={onChange} 
        />
      
    </div>;
  
});

/*

        */

export default IVEditor;


