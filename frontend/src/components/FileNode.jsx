// frontend/src/components/FileNode.jsx
import React, { useState } from 'react';
import { useTabs } from './TabContext';

const FileNode = ({ name, path, isDirectory, level, dir }) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);

  const { openFile } = useTabs();

  const toggle = async () => {
    if (!isDirectory) {
      console.log('Clicked file:', `${path}${name}`);
      openFile(`${path}${name}`);
      return;
    }

    if (!expanded && children.length === 0) {
      const entries = await dir.listFiles(`${path}${name}/`);
      setChildren(entries);
    }

    setExpanded(!expanded);
  };

  return (
    <div style={{ paddingLeft: level * 16 }}>
      <div onClick={toggle} style={{ cursor: isDirectory ? 'pointer' : 'default' }}>
        {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
      </div>
      {expanded && children.map(child => (
        <FileNode
          key={child.name}
          name={child.name}
          path={`${path}${name}/`}         // ✅ preserve full pseudo-path
          isDirectory={child.isDirectory}
          level={level + 1}
          dir={dir}
        />
      ))}
    </div>
  );
};

export default FileNode;
