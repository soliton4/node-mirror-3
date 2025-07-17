# Node Mirror 3 – Web IDE with Real Filesystem Integration

Node Mirror 3 is a modular, browser-based IDE and file explorer built with:
- A real filesystem backend (via Node.js)
- React + Vite for the frontend
- CodeMirror 6 for text editing
- A custom virtual file ID system
- WebSocket-based authentication and RPC

## Features

- ✅ Browse and edit local files from a configurable root
- ✅ Real-time saving and reloading
- ✅ Switch between CodeMirror (text) and hex editor views
- ✅ Modular editor design (plugin-style)
- ✅ Secure virtual filesystem sandbox
- ✅ Command-line, config-file, and in-code configuration
- ✅ Lightweight backend using Express + WS
- ✅ Configurable public/private config visibility

## Project Structure

```
.
├── backend/               # Node.js backend logic
│   ├── auth.js            # Basic login/password auth
│   ├── configLoader.js    # CLI + file-based config system
│   ├── configSchema.js    # Config metadata, visibility, etc.
│   ├── file-system.js     # File abstraction + content mgmt
│   ├── index.js           # Main server entry point
│   ├── pathTranslation.js # Virtual path ↔ real path logic
│   └── side.js            # Determines client/server side
├── frontend/              # Vite + React frontend
│   ├── src/components/
│   │   ├── FileView.jsx           # Main editor switcher + control bar
│   │   ├── editors/
│   │   │   ├── CodeMirrorEditor.jsx  # CM6 integration
│   │   │   └── HexEditor.jsx     # Hex viewer (placeholder)
│   └── index.html         # Vite entry point
├── shared/                # Shared objects like `File.js`
├── fake-backend/          # Optional fake server (for future testing)
├── package.json
└── README.md              # ← You are here
```

## Configuration

Handled via:
- CLI arguments (`--password`, `--dir`, etc.)
- JSON config file (`~/.node-mirror-3.config.json`)
- Defaults defined in `configSchema.js`

### Example CLI:

```
npm start -- --password secret123 --dir /home/user/projects
```

### Example config file:

```json
{
  "rootDir": "/home/user/projects",
  "password": "secret123",
  "port": 3000
}
```

Each config option in `configSchema.js` includes:
- `default` value
- `cliFlag` (like `--dir`)
- `frontendVisible` (boolean)
- `readOnly` (boolean)
- `description` string

## Key Concepts

### Virtual Path Abstraction

Virtual IDs like `/package.json` map securely to real disk paths under a single `rootDir`. Ensures safe access without leaking absolute paths.

### File Ownership

- `FileView` owns the `fileObj`
- Editors receive it as a prop but do not "own" the file
- Editors only call `.setContent()` or `.save()`
- This makes it possible to implement `close()` logic in future

### Saving & Reloading

`File.js` (shared object) provides:

- `getContent()` → buffer or disk
- `setContent()` → update buffer
- `save()` → write to disk
- `reload()` → discard buffer and load fresh from disk

### Config Metadata

Everything is defined in `configSchema.js` once:

```js
port: {
  default: 3000,
  cliFlag: '--port',
  frontendVisible: true,
  readOnly: true,
  description: 'Backend HTTP port'
}
```

This drives:
- Defaults
- CLI flag parsing
- Frontend exposure
- Tooltips and docs

## Development Setup

```
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

## Running the App

To build and launch:

```
npm start -- --password secret123
```

To start dev frontend only:

```
cd frontend
npm run dev
```

## Security Notes

- Simple password authentication via WebSocket
- Password is never exposed on frontend
- Public config fields are whitelisted explicitly

## Known Design Constraints

- Must avoid multiple instances of `@codemirror/state`
- Errors in `reload()` must be caught manually
- Config system is backend-only (no SSR)

## TODO

- [ ] Hex editor implementation
- [ ] File close logic with resource cleanup
- [ ] Better error reporting (client ↔ server)
- [ ] Tab manager and multi-file sessions
- [ ] Editable config panel in frontend (respects `readOnly`)
- [ ] Optional plugin loader (e.g. Vim bindings, themes)

## AI App Development Experiment

I am using this project as an experiment in AI-based development. The first commit was created almost entirely with help of this [ChatGPT interaction](https://chatgpt.com/share/6878426f-5e0c-8013-8ea2-3a39aa910a91).

## License

This project is licensed under a modified BSD 3-Clause License.

Copyright (c) Benjamin Behrens 2025

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions, and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions, and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.
4. **Modified versions must include a notice acknowledging the original project and author.**

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES...

See `LICENSE` file for full details.
