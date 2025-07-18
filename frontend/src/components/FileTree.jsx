// frontend/src/components/FileTree.jsx

import React, { useEffect, useState } from 'react';
import Dir from '../../../shared/objects/Dir.js';
import FileNode from './FileNode';

export default function FileTree() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadRoot = async () => {
      const dir = Dir('/');
      const contents = await dir.listFiles('/');
      setFiles(contents);
    };
    loadRoot();
  }, []);

  return (
    <div>
      {files.map((file) => (
        <FileNode
          key={file.name}
          path="/"
          name={file.name}
          isDirectory={file.isDirectory}
          level={0}
          dir={Dir('/')}
        />
      ))}
    </div>
  );
}
