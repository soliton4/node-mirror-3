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
    <div ref={scrollContainerRef} style={{ userSelect: 'none' }}>
      <FileTreeToolbar />
      {files.map((file) => (
        <FileNode
          key={file.name}
          path="/"
          name={file.name}
          isDirectory={file.isDirectory}
          level={0}
          dir={Dir('/')}
          scrollContainerRef={scrollContainerRef}
        />
      ))}
    </div>
  );
}
