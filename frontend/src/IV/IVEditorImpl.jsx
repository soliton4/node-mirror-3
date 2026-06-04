import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useGlobal } from '../GlobalContext';
import { useConfig } from '../ConfigContext';

import uiFactory from './uiFactory';
import IVEditorModel from './IVEditorModel';


const IVEditorImpl = forwardRef((props, ref) => {
  const [rawValue, setRawValue] = useState('');

  const modelRef = useRef(new IVEditorModel());

  const wrapperRef = useRef(null);


  const applyValue = (newValue) => {
    setRawValue(newValue);
    modelRef.current.setValue(newValue);

  };

  useImperativeHandle(ref, () => ({
    setValue(newValue) {
      return applyValue(newValue);
    },

    getValue() {
      return value;
    },
  }));

  return <div
    ref={wrapperRef}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}
    >

    {/* content */}
    {/*model.render()*/}
    
    </div>;
  
});

function TreeNodeView({ data }) {
  const uiNode = uiFactory.display(data);
  return uiNode.render();
};


export default IVEditorImpl;


