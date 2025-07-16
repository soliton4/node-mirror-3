// backend/pathTranslation.js
// ------------------------------------------------------------------
// Maps virtual file‑IDs (e.g. "/package.json") to absolute disk paths
// and vice‑versa, while enforcing a single safe root directory.
// ------------------------------------------------------------------

import path from 'path';
import { fileURLToPath } from 'url';

import { getConfig } from './configLoader.js'


// NEW (after importing getConfig)
const { rootDir } = await getConfig();

const rootPath = rootDir;

/* ------------------------------------------------------------------
 * Helper: secure join + directory‑traversal guard
 * ------------------------------------------------------------------ */
function resolveInsideBase(relative) {
  // Normalize, strip leading “/” so path.join won’t ignore base
  const safeRel = path.normalize(relative).replace(/^[/\\]+/, '');
  const abs     = path.join(rootPath, safeRel);

  // Guard: must remain inside rootPath
  if (!abs.startsWith(rootPath)) {
    throw new Error(`Access denied: ${relative}`);
  }
  return abs;
}

/* ------------------------------------------------------------------
 * API
 * ------------------------------------------------------------------ */
/** Convert virtual ID (e.g. "/foo/bar.txt") → absolute path inside rootPath */
export function idToAbsPath(id) {
  return resolveInsideBase(id);
}

/** Convert absolute path → virtual ID that starts with “/” */
export function absPathToId(abs) {
  const rel = path.relative(rootPath, abs);
  if (rel.startsWith('..')) {
    throw new Error(`Path ${abs} is outside rootPath`);
  }
  return '/' + rel.replace(/\\/g, '/');   // ensure POSIX style for IDs
}

/** Optionally expose rootPath for logging/debug */
export const virtualRoot = rootPath;
