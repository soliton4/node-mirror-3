// frontend/src/components/Navigation.jsx

import React from 'react';
import { Accordion } from "radix-ui";
import FileTree from './FileTree';
import Terminal from './Terminal';
import Config from './Config';
import { useConfig } from './../ConfigContext';

import { Flex, Button, useThemeContext } from '@radix-ui/themes';
import './navigation.css';

const Navigation = ({  }) => {


  const { config, updateConfig } = useConfig();

  const toggleDarkMode = () => {
    const next = config.appearance === 'dark' ? 'light' : 'dark';
    updateConfig({ appearance: next });
  };



  
  return (
    <div className="navigation-pane navigation">
      <Flex gap="2" p="2" align="center" justify="between">
        <Button onClick={toggleDarkMode}>
          {config.appearance === 'dark' ? '🌙 Dark' : '🌞 Light'}
        </Button>
      </Flex>

      {/* Accordion */}
      <Accordion.Root
        type="single"
        defaultValue="files"
        collapsible={false}
        className="accordion-root"
      >
        <Accordion.Item className="accordion-item" value="files">
          <Accordion.Header className="accordion-header">
            <Accordion.Trigger className="accordion-trigger">Files</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount className="accordion-content">
            <FileTree />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item className="accordion-item" value="terminal">
          <Accordion.Header className="accordion-header">
            <Accordion.Trigger className="accordion-trigger">Terminal</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="accordion-content">
            <Terminal />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item className="accordion-item" value="config">
          <Accordion.Header className="accordion-header">
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
