// frontend/src/VerticalSplitter.jsx

import React from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

export default function VerticalSplitter({ left, right }) {
  return (
    <PanelGroup direction="horizontal" className="split-container">
      <Panel defaultSize={20} minSize={10}>
        <div className="split-pane">{left}</div>
      </Panel>

      <PanelResizeHandle className="split-resizer" />

      <Panel minSize={20}>
        <div className="split-pane">{right}</div>
      </Panel>
    </PanelGroup>
  );
}
