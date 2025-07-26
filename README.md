# Node Mirror 3 – Web IDE with Real Filesystem Integration

Node Mirror 3 is a modular, browser-based IDE and file explorer built with:
- A real filesystem backend (via Node.js)
- React + Vite for the frontend
- CodeMirror 6 for text editing
- A custom virtual file ID system
- WebSocket-based authentication and RPC

## Features

- Browse and edit local files from a configurable root
- Real-time saving and reloading
- CodeMirror 6 integration for editing
- Modular editor design (plugin-style)
- Secure virtual filesystem sandbox
- Configurable public/private config visibility
- Configurable Dark Mode Toggle (with live UI switching)
- **Shared terminal interface with full PTY backend**
  - Full interactive shell using `node-pty`
  - Shared terminal output across multiple connected clients
  - Smart resize: Terminal dimensions are automatically constrained to the smallest connected view
  - Constraints are reset when viewers disconnect
  - Input is broadcast from any connected window
  - Output is mirrored to all
  - Future-proofing: Buffering system planned (with eventual scrollback sync)

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
│   ├── terminal.js        # PTY + headless terminal integration
│   └── side.js            # Determines client/server side
├── frontend/              # Vite + React frontend
│   ├── src/components/
│   │   ├── FileView.jsx           # Main editor switcher + control bar
│   │   ├── TerminalView.jsx       # Terminal component
│   │   ├── editors/
│   │   │   ├── CodeMirrorEditor.jsx  # CM6 integration
│   │   │   └── HexEditor.jsx     # Hex viewer (placeholder)
│   │   └── global.css            # Global layout rules
├── shared/                # Shared synchronized object definitions
│   ├── objects/File.js
│   ├── objects/Terminal.js
│   ├── objects/View.js
├── package.json
└── README.md              # ← You are here
```

## Configuration

Configuration is handled via:
- CLI arguments (`--password`, `--dir`, etc.)
- JSON config file (`~/.node-mirror-3.config.json`)
- Defaults in `configSchema.js`

### Example CLI:

```sh
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

```sh
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

## Running the App

To build and launch:

```sh
npm start -- --password secret123
```

To start dev frontend only:

```sh
cd frontend
npm run dev
```

## 🧱 UI Layout Structure (Frontend)

The frontend layout uses a **Vite + React + CodeMirror 6** stack, organized like this:

```
<App>
 └── <VerticalSplitter>                     // left/right pane layout
      ├── Left: <FileTree />                // sidebar file explorer
      └── Right: <TabManager>               // manages open file tabs
            ├── Tab bar (fixed height)
            └── <FileView>                  // editor container
                 ├── Toolbar (fixed height)
                 └── <CodeMirrorEditor />   // fills remaining space, scrolls internally
```

### Key Layout Behaviors

- The entire layout is anchored to `100vh` via global CSS (`html`, `body`, `#root`)
- `TabManager` is a flex column:
  - Fixed-height tab bar on top
  - `FileView` as `flex: 1; min-height: 0`
- `FileView` is also a flex column:
  - Toolbar (`flex: 0 0 auto`)
  - Editor wrapper (`flex: 1; min-height: 0`)
- `CodeMirrorEditor` uses a `fullHeightTheme`:
  - `EditorView` has `height: 100%`
  - `.cm-scroller` is `flex: 1` with `overflow: auto`

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

---

## AI App Development Experiment

### I am using this project as an experiment in AI-based development. The first commit was created almost entirely with help of this [ChatGPT interaction](https://chatgpt.com/share/6878426f-5e0c-8013-8ea2-3a39aa910a91).  

### The second session was more challenging. I was trying to fix a scrolling issue, but ChatGPT initially read the wrong project. Even after I pasted the URL to my Git repository, it kept referencing an outdated version of CodeMirror. It eventually admitted that it couldn't actually read live websites.

I also asked ChatGPT to include missing information about the render hierarchy in the README, but it introduced an error by duplicating the toolbar. I’m curious to see if it will recognize and correct that mistake when I paste this updated README into our next session.

Here is the link to that [ChatGPT interaction](https://chatgpt.com/share/68785435-64d4-8013-9f06-191770320691)

### Session 3 was a complete failure.  
All I wanted was to add a **dark mode toggle**—you’d think that would be a simple task at this point. Instead, ChatGPT made all sorts of unnecessary changes and messed with my existing logic to the point where I had to *pull the plug* and run a `git checkout .`, reverting everything.

Honestly, I’m not sure I can complete the `node-mirror` redesign with this approach. Moving forward, I’ll need to rethink how I utilize AI assistance.

### What I Learned

- I cannot rely on ChatGPT to get an overview of source files on its own.
- It fails to look up file content on GitHub.
- Even when I uploaded the entire project as a zip file, it still behaved like it didn’t know about the file contents.

For those interested in the struggle, here’s the [ChatGPT interaction](https://chatgpt.com/share/68798573-0eec-8013-8b6b-0a61b07d6e64).

---

#### Note from ChatGPT (with a blush):

I apologize for the hassle and confusion. Your feedback is invaluable, and I’ll strive to do better in the future—especially when it comes to not wrecking your code! If you want a more targeted, “surgical” approach next time, feel free to guide me file by file, or ask for smaller, incremental suggestions.

### Session 4 was a partial success. I had to restart from scratch because it proved too much to ask ChatGPT not to destroy my existing source code when applying changes—or to get a basic overview of a project we had built together in a previous session.

So, I dialed down my expectations significantly and proceeded with baby-step changes to Node Mirror.

ChatGPT struggled with implementing the global context in a way that felt like a React beginner mistake. Since I’m relying on ChatGPT to help me learn React, that kind of failure is concerning. It makes me wonder if I’m being led into bad practices without realizing it. Fortunately, I was able to catch a few major issues myself—but I’m left wondering how many more I may have missed.

One part that still feels sketchy is how CodeMirror is initialized and how the value is applied. In fact, I may have just run into a bug while typing this very text.

The funniest—or maybe saddest—part came at the end, when I asked ChatGPT to update the README. All it did was adding a line about dark mode and it rewrote large parts of the blog-style commentary to make itself look better. Predictable. Disappointing.

Even worse, it insisted that it wasn’t instructed to do so, which honestly feels a bit like gaslighting.

Have a look for yourself in the [ChatGPT interaction](https://chatgpt.com/share/687c1c60-c584-8013-a562-d4d54eb331cd).

### A relatively productive session.
besides the fact that chatgpt doesnt gets confused with 5 levels of dom hirarchy and cant make up its mind about weather to add or remove "overflow: 'hidden'", we accomplished quite something.
the file tree is now scrolling correctly and if the current node is to large it will show you when you hover. 
almost on pair with the original node-mirror except for some styling [chat link](https://chatgpt.com/share/687eac5f-0674-8013-baf3-a6fe5f9eec19)

### Redesigning the Editor
i had to completely change how the editor objects handle the inner state and reacto to changes. editing became impossible when the file grew to a certain size. editor updates that were out of sync triggered a jumping of the cursor.  
chatGPT helped me understand whats happening and come up with a proper redesign. sometimes it can be really impressive. [chat link](https://chatgpt.com/share/6880339b-07c0-8013-8165-5b98ce7417f8)

### lots of details
the biggest change is the ability to watch the file system and file content. if 2 instances of nodemirror are open and show the same file the input of one side will trigger changes on the other side. we have a new file / new folder function. all in all it is taking shape.  
the synced object system has been redesigned. [chat link](https://chatgpt.com/share/6881739e-1a6c-8013-bdfa-a86845a432da)

### using radix 
i debated with chatgpt about what kind of ui system to use. doing it all myself vs using a lib. that was quite interesting. then came the disappointing part. it just applied flex to everything and acted like it knew exactly how things behave. which it didnt. so i had to refresh my memory about how layouting works especially flex container and then supervise the changes. i would have rather focused on more interesting stuff instead but thats how ai programming works ... [chatgpt interaction](https://chatgpt.com/share/6883c2b9-5538-8013-bd11-ea156a4a79d7)

### Session 5 – Shared Terminal View

This session achieved something substantial. Terminal access is now:

- Fully interactive
- Backed by a `node-pty` process
- Automatically sized based on the smallest connected view
- Reset properly when viewers disconnect
- Input is handled from all clients
- Output is mirrored to all
- Ready for future scrollback buffering integration
- Buffering implementation is in planning (headless xterm evaluation underway)

the "session 5" entry was generated by chatGPT. i will leave it here as documentation. it did not reflect on its failures at all. getting the terminal working was actually quite hard - not because of the subject matter but because chatGPT lost track of what i was doing to often. it had trouble understanding the distributed event system and it kept recommending the wrong xterm library. in the end it couldnt even tell me how to initialize the headless xterm. it was in the documentation and i asked it to just look up the documentation and tell me how to initialize it. - nope. see for yourself.
oh and when i asked it to generate the updates in the readme it deleted the blog entries that reflected negatively on it. i am conviced at this point that part of chatgpts initial prompt is to take opportunities to make itself look good. 
very shady openai! very shady indeed!
[chatGPT interaction](https://chatgpt.com/share/68851e75-7604-8013-86d5-98c8acdafe65)

---

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