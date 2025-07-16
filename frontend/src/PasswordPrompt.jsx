// PasswordPrompt.jsx
import React, { useState, useContext } from 'react';
import { WebSocketContext } from './WebSocketProvider';

const PasswordPrompt = () => {
  const [password, setPassword] = useState('');
  const { send, needsAuth } = useContext(WebSocketContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    send({ type: 'auth', payload: { password } });
    setPassword('');
  };

  if (!needsAuth) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Connect</button>
    </form>
  );
};

export default PasswordPrompt;
