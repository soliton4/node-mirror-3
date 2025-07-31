// frontend/src/components/TerminalSidebar.jsx
import React, { useEffect, useRef, useState } from 'react';
import Terminal from '../../../shared/objects/Terminal';
import { useTabs } from './TabContext';
import {
  Button,
  Text,
  Box,
  Card,
  Flex,
  ScrollArea
} from '@radix-ui/themes';

const TerminalSidebar = () => {
  const terminalMaster = useRef(null);
  const [terminalIds, setTerminalIds] = useState([]);
  const { open } = useTabs();

  const handleNewTerminal = async () => {
    if (!terminalMaster.current) return;
    await terminalMaster.current.createTerminal();
    const ids = await terminalMaster.current.listTerminals();
    setTerminalIds(ids);
  };

  useEffect(() => {
    const master = Terminal('terminals');
    terminalMaster.current = master;

    const update = async () => {
      const ids = await master.listTerminals();
      setTerminalIds(ids);
    };

    update();
    const unsubscribe = master.on('change', update);

    return () => {
      unsubscribe();
      master.done();
      terminalMaster.current = null;
    };
  }, []);

  const handleClick = (id) => {
    open('terminal', id, id);
  };

  return (
    <Card variant="classic" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Flex justify="between" align="center" p="2" style={{ borderBottom: '1px solid var(--accent-a3)' }}>
        <Text weight="bold">Terminals</Text>
        <Button size="1" variant="solid" onClick={handleNewTerminal}>
          New
        </Button>
      </Flex>

      <Box flex="1" p="2">
        <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
          {terminalIds.length === 0 ? (
            <Text size="1" color="gray">No terminals yet.</Text>
          ) : (
            <Box as="ul" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {terminalIds.map((id) => (
                <Box
                  as="li"
                  key={id}
                  onClick={() => handleClick(id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-a3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Text size="1">🖥️ {id}</Text>
                </Box>
              ))}
            </Box>
          )}
        </ScrollArea>
      </Box>
    </Card>
  );
};

export default TerminalSidebar;
