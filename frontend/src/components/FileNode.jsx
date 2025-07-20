// frontend/src/components/FileNode.jsx
import React, { useState } from 'react';
import { useTabs } from './TabContext';

const FileNode = ({ name, path, isDirectory, level, dir }) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);

  const [hovered, setHovered] = useState(false);

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
    setHovered(false);
  };

  return (
    <div 
      style={{ position: 'relative' }}
      >
      <div onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)} onClick={toggle} 
        style={{ 
          paddingLeft: level * 16, 
          cursor: isDirectory ? 'pointer' : 'default',
          whiteSpace: 'nowrap',         // ← prevents line wrap
          overflow: 'hidden',           // ← prevents overflow
        }}>
        {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
      </div>
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: level * 16,
            background: 'rgba(50, 50, 50, 0.7)',
            color: 'white',
            padding: '0px',
            zIndex: 999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',         // ← prevents line wrap
            overflow: 'hidden',           // ← prevents overflow
          }}
        >
          {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
        </div>
      )}
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
