import React, { useEffect, useRef, useState } from 'react';
import Terminal from '../../../shared/objects/Terminal'; // shared terminal master object
import { useTabs } from './TabContext'; // to use the `open` function

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
    const unsubscribe = master.on("change", update);

    return () => {
      unsubscribe();
      master.done();
      terminalMaster.current = null;
    };
  }, []);

   const handleClick = (id) => {
    open('terminal', id, id); // type, id, name
  };

  return (
    <div className="terminal-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
        <strong>Terminals</strong>
        <button onClick={handleNewTerminal}>New</button>
      </div>

      <div className="terminal-list" style={{ padding: '0.5rem' }}>
        {terminalIds.length === 0 ? (
          <p>No terminals yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {terminalIds.map((id) => (
              <li
                key={id}
                onClick={() => handleClick(id)}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                🖥️ {id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TerminalSidebar;
