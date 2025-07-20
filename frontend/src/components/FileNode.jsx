// frontend/src/components/FileNode.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useTabs } from './TabContext';

const FileNode = ({ name, path, isDirectory, level, dir, scrollContainerRef }) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);

  const nodeRef = useRef(null);
  const [overlayStyle, setOverlayStyle] = useState(null);

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

  useEffect(() => {
    if (!hovered || !nodeRef.current) return;
  
    let animationFrameId;
  
    const update = () => {
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        setOverlayStyle({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
      animationFrameId = requestAnimationFrame(update);
    };
  
    update(); // Start loop
  
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hovered]);



  return (
    <div 
      style={{ position: 'relative' }}
      >
      <div 
        ref={nodeRef} 
        onMouseEnter={() => {
          if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            console.log({
              top: rect.top,
              left: rect.left,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
              x: rect.x,
              y: rect.y,
            });
            setOverlayStyle({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }
          setHovered(true);
        }}
      onMouseLeave={() => setHovered(false)} onClick={toggle} 
        style={{ 
          paddingLeft: level * 16, 
          cursor: isDirectory ? 'pointer' : 'default',
          whiteSpace: 'nowrap',         // ← prevents line wrap
          overflow: 'hidden',           // ← prevents overflow
        }}>
        {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
      </div>
      {hovered && overlayStyle && createPortal(
        <div style={{
          position: 'fixed',
          paddingLeft: level * 16,
          top: overlayStyle.top,
          left: overlayStyle.left,
          width: overlayStyle.width,
          height: overlayStyle.height,
          background: 'rgba(50, 50, 50, 0.7)',
          color: 'white',
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none',
        }}>
          {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
        </div>,
        document.body
      )}
      {expanded && children.map(child => (
        <FileNode
          key={child.name}
          name={child.name}
          path={`${path}${name}/`}
          isDirectory={child.isDirectory}
          level={level + 1}
          dir={dir}
          scrollContainerRef={scrollContainerRef}
        />
      ))}
    </div>
  );
};

export default FileNode;
