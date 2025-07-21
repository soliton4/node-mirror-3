// frontend/src/components/FileTree.jsx

import React, { useEffect, useState, useRef } from 'react';
import Dir from '../../../shared/objects/Dir.js';
import FileNode from './FileNode';
import FileTreeToolbar from './FileTreeToolbar';



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
      <FileTreeToolbar />
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
            path={"/"}
            name={"/"}
            isDirectory={true}
            level={0}
            dir={Dir('/')}
            scrollContainerRef={scrollContainerRef}
          />
      </div>
    </div>
  );
}
