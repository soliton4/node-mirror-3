// frontend/src/components/FileNode.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Portal, Theme } from "@radix-ui/themes";

import { useTabs } from './TabContext';

import Dir from '../../../shared/objects/Dir2.js';
import '../file/file.css';

const FileNode = ({ name, id, isDirectory, level, scrollContainerRef }) => {
  const [expanded, setExpanded] = useState(level === 0 ? true : false);
  const [children, setChildren] = useState([]);

  const nodeRef = useRef(null);
  const [overlayStyle, setOverlayStyle] = useState(null);

  const [hovered, setHovered] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isNewDir, setIsNewDir] = useState(true); // default to folder
  const inputRef = useRef(null);


  const { open } = useTabs();

  const toggle = async () => {
    if (!isDirectory) {
      const name = id.split('/').filter(Boolean).pop() || '/';
      open("file", id, name);
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
      
      dir.on("change", fetch);

      return () => {
        cancelled = true;
        dir.done(); // <-- will be called when the component unmounts or dependencies change
      };
    }, [id]);

  };
  const createNewItem = (name, isFolder)=>{
    const dir = Dir(id);
    dir.createNew(name, isFolder);
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


  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);


  useEffect(() => {
    if (showNewDialog && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNewDialog]);



  return (
    <div 
      className={ isDirectory ? "file-node directory" : "file-node" }
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
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        className="text-node"
        style={{ 
          top: isDirectory ? `${level * 24}px` : undefined, 
          zIndex: isDirectory ? `${100 - level}` : undefined,
          paddingLeft: level * 16, 
        }}>
        {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
      </div>
      { hovered && overlayStyle && (<Portal><Theme>
        <div className="file-node text-node overlay-node" style={{
          paddingLeft: level * 16,
          top: overlayStyle.top,
          left: overlayStyle.left,
          width: "auto",
          height: overlayStyle.height,
        }}>
          {isDirectory ? (expanded ? '📂' : '📁') : '📄'} {name}
        </div>
      </Theme></Portal>)}
      {expanded && children.map(child => (
        <FileNode
          key={`${id === "/" ? "/" : id + "/"}${child.name}`}
          name={child.name}
          id={`${id === "/" ? "/" : id + "/"}${child.name}`}
          isDirectory={child.isDirectory}
          level={level + 1}
          scrollContainerRef={scrollContainerRef}
        />
      ))}

      {contextMenu && createPortal(
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <div className="context-menu__item" onClick={() => {
            setContextMenu(null);
            toggle();
          }}>
            Open
          </div>
          {isDirectory && (
            <div className="context-menu__item" onClick={() => {
              setContextMenu(null);
              setShowNewDialog(true);
            }}>
              New…
            </div>
          )}
        </div>,
        document.body
      )}



      {showNewDialog && createPortal(
        <div className="new-dialog">
          <h4>Create New</h4>
          <input
            ref={inputRef}
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter name"
          />
          <div className="type-selector">
            <label>
              <input
                type="radio"
                checked={isNewDir}
                onChange={() => setIsNewDir(true)}
              /> Folder
            </label>
            <label>
              <input
                type="radio"
                checked={!isNewDir}
                onChange={() => setIsNewDir(false)}
              /> File
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => {
              console.log(`Create ${isNewDir ? 'folder' : 'file'}: ${newItemName} in ${id}`);
              createNewItem(newItemName, isNewDir);
              setShowNewDialog(false);
              setNewItemName('');
            }}>Create</button>
            <button onClick={() => setShowNewDialog(false)}>Cancel</button>
          </div>
        </div>,
        document.body
      )}

      
    </div>
  );
};

export default FileNode;
