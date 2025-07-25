// frontend/src/components/FileTree.jsx

import React, { useEffect, useState, useRef } from 'react';
import Dir from '../../../shared/objects/Dir.js';
import FileNode from './FileNode';



export default function FileTree({ }) {
  const [files, setFiles] = useState([]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadRoot = async () => {
      const dir = Dir('/');
      const contents = await dir.listFiles('/');
      setFiles(contents);
    };
    loadRoot();
  }, []);

  return (
    <div 
      style={{ 
        userSelect: 'none',  
        overflow: "hidden",
        height: "100%",
      }}
      >
      <div
        ref={scrollContainerRef} 
        style={{ 
          userSelect: 'none',  
          overflowX: "hidden",
          overflowY: "auto",
          height: "100%",
        }}
        >
          <FileNode
            key={"/"}
            id={"/"}
            name={"/"}
            isDirectory={true}
            level={0}
            scrollContainerRef={scrollContainerRef}
          />
      </div>
    </div>
  );
}
