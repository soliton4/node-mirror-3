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
      style={{
        display: 'flex',
        height: '100vh',
        userSelect: dragging ? 'none' : 'auto',
      }}
    >
      <div style={{ width: dividerX, backgroundColor: '#f0f0f0', overflow: 'auto' }}>
        {left}
      </div>
      <div
        style={{
          width: 5,
          cursor: 'col-resize',
          backgroundColor: '#ccc',
        }}
        onMouseDown={() => setDragging(true)}
      />
      <div style={{ flex: 1, backgroundColor: '#fff', overflow: 'auto' }}>
        {right}
      </div>
    </div>
  );
}
