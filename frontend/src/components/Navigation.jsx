// frontend/src/components/Navigation.jsx

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import FileTree from './FileTree';
import Terminal from './Terminal';
import Config from './Config';

const Navigation = ({ darkMode, onToggleDarkMode }) => {
  return (
    <div className="navigation-pane">
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={onToggleDarkMode}>
          {darkMode ? '🌙 Dark' : '🌞 Light'}
        </button>
      </div>

      {/* Accordion */}
      <Accordion.Root
        type="single"
        defaultValue="files"
        collapsible
        className="accordion-root"
      >
        <Accordion.Item className="accordion-item" value="files">
          <Accordion.Header>
            <Accordion.Trigger className="accordion-trigger">Files</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount className="accordion-content">
            <FileTree darkMode={darkMode} />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item className="accordion-item" value="terminal">
          <Accordion.Header>
            <Accordion.Trigger className="accordion-trigger">Terminal</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="accordion-content">
            <Terminal />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item className="accordion-item" value="config">
          <Accordion.Header>
            <Accordion.Trigger className="accordion-trigger">Config</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="accordion-content">
            <Config />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default Navigation;
