// backend/file-system.js

import path from 'path';
import fs  from 'fs/promises';
import {idToAbsPath} from "./pathTranslation.js"

// we export one single object because this file needs to be imported both on the backend and frontend side.
// this file is the backend version but the frontend version simply exports a {}
// thats why we have no specific named exports, otherwise it would break the inport on the frontend
export default {
  async readFileStr(id){
    return fs.readFile(idToAbsPath(id), 'utf8');
  },
  async writeStringToFile(id, contentStr){
    return fs.writeFile(idToAbsPath(id), contentStr, 'utf8');
  },

  /* ---- NEW helper: list directory by id ---- */
  async listDir(dirId) {
    const absDir = idToAbsPath(dirId);
    const entries = await fs.readdir(absDir, { withFileTypes: true });

    return entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      path: path.posix.join(dirId, e.name)   // virtual path, posix style
    }));
  },
  async createNew(dirId, name, isDir) {
    const targetPath = path.join(idToAbsPath(dirId), name);
  
    try {
      const stat = await fs.stat(targetPath);
      throw new Error(`"${name}" already exists in "${dirId}"`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err; // only proceed if file doesn't exist
    }
  
    if (isDir) {
      await fs.mkdir(targetPath, { recursive: false });
    } else {
      await fs.writeFile(targetPath, '', 'utf8');
    }
  },

  /* ---- NEW helper: existence check (handy later) ---- */
  async exists(id) {
    return !!(await statSafe(idToAbsPath(id)));
  }
};
