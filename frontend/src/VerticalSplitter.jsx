// frontend/src/VerticalSplitter.jsx

import React, { useState, useRef, useEffect } from 'react';

export default function VerticalSplitter({ left, right }) {
  const containerRef = useRef(null);
  const [dividerX, setDividerX] = useState(300); // Initial width of left panel
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      let newX = e.clientX - rect.left;
      const min = 100;
      const max = rect.width - 100;
      if (newX < min) newX = min;
      if (newX > max) newX = max;
      setDividerX(newX);
    }

    function onMouseUp() {
      setDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={containerRef}
      className="split-container"
      style={{
        display: 'flex',
        height: '100%',
        userSelect: dragging ? 'none' : 'auto',
        position: 'relative',
      }}
      >
      <div className="split-left" style={{
        width: dividerX,
        minHeight: 0,
        minWidth: 0,  
        overflow: 'hidden',     
        height: '100%',       
      }}>
        {left}
      </div>
      <div
        className="split-divider"
        style={{ width: 5, cursor: 'col-resize' }}
        onMouseDown={() => setDragging(true)}
      />
      <div className="split-right" style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,  
        overflow: "hidden",  
      }}>
        {right}
      </div>
    </div>
  );
}
