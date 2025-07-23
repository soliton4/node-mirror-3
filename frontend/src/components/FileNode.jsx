// frontend/src/components/FileNode.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useTabs } from './TabContext';

import Dir from '../../../shared/objects/Dir2.js';

const FileNode = ({ name, id, isDirectory, level, scrollContainerRef }) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);

  const nodeRef = useRef(null);
  const [overlayStyle, setOverlayStyle] = useState(null);

  const [hovered, setHovered] = useState(false);

  const { openFile } = useTabs();

  const toggle = async () => {
    if (!isDirectory) {
      openFile(id);
      return;
    }

    setExpanded(!expanded);
    setHovered(false);
  };
  if (isDirectory) {
    useEffect(() => {
      const dir = Dir(id);
      let cancelled = false;

      const fetch = async () => {
        const c = await dir.children();
        if (!cancelled) setChildren(c);
      };
      fetch();

      return () => {
        cancelled = true;
        dir.done(); // <-- will be called when the component unmounts or dependencies change
      };
    }, [id]);

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
            setOverlayStyle({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)} 
        onClick={toggle} 
        style={{ 
          position: isDirectory ? 'sticky' : 'relative',  
          top: isDirectory ? `${level * 24}px` : undefined, 
          zIndex: isDirectory ? `${100 - level}` : undefined,
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
          name={child.name}
          id={`${id === "/" ? "/" : id + "/"}${child.name}`}
          isDirectory={child.isDirectory}
          level={level + 1}
          scrollContainerRef={scrollContainerRef}
        />
      ))}
    </div>
  );
};

export default FileNode;
