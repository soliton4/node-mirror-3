import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cookie from 'cookie';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import http from 'http';

import connectionManager from '../shared/ConnectionManager.js';
import factory from '../shared/Factory.js';
import used from '../shared/objects/used.js';



factory.init(connectionManager, "server");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../frontend/dist');


const sessionStore = new Map(); // sessionId -> { authenticated: false }

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to assign sessionId if not present
app.use((req, res, next) => {
  let { sessionId } = req.cookies;

  if (!sessionId || !sessionStore.has(sessionId)) {
    sessionId = crypto.randomUUID();
    sessionStore.set(sessionId, { authenticated: false });

    res.cookie('sessionId', sessionId, {
      httpOnly: false, // if you want client-side access, otherwise true for security
      sameSite: 'Lax',
      secure: false,   // set to true in production w/ HTTPS
    });
  }

  req.sessionId = sessionId; // Save for later use if needed
  next();
});


app.use(express.static(frontendPath));



function generateSessionId() {
  return crypto.randomUUID(); // Or use uuid
}


const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const activeConnections = new Map();

wss.on('connection', (ws, req) => {

  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.sessionId;
  const session = sessionStore.get(sessionId);

  console.log(`New WS connection with sessionId: ${sessionId}`);

  connectionManager.add(ws, session?.authenticated);

});


server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
