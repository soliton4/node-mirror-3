import fs from 'fs/promises';
import path from 'path';
import os  from 'os';
import minimist from 'minimist';
import { configSchema } from './configSchema.js';

let _cachedConfig;

/** public entry – always returns same object */
export async function getConfig() {
  if (_cachedConfig) return _cachedConfig;

  // 1. defaults from schema
  const config = Object.fromEntries(
    Object.entries(configSchema).map(([k, v]) => [k, v.default])
  );


  const argv = minimist(process.argv.slice(2));
  const configFileFromArg = argv['config-file'];

  let usedConfigFile = path.join(os.homedir(), '.node-mirror-3.config.json');

  // 2. If --config-file is passed, load it first
  if (configFileFromArg) {
    usedConfigFile = configFileFromArg;
  }
  await mergeFile(usedConfigFile, config);
  config._configFileUsed = usedConfigFile;


  // 4. CLI flags
  mergeCli(argv, config);


  _cachedConfig = config;
  return config;
}

/* ---------- helpers ---------- */
async function mergeFile(filePath, cfgObj) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    Object.assign(cfgObj, data);
  } catch { /* ignore if missing */ }
}

function mergeCli(argv, cfgObj) {
  for (const [key, meta] of Object.entries(configSchema)) {
    if (!meta.cliFlag) continue;
    const flagName = meta.cliFlag.replace(/^--/, '');
    if (argv[flagName] !== undefined) cfgObj[key] = argv[flagName];
  }
}

/** expose only safe keys */
export async function getPublicConfig() {
  const cfg = await getConfig();
  return Object.fromEntries(
    Object.entries(configSchema)
      .filter(([_, meta]) => meta.frontendVisible)
      .map(([k]) => [k, cfg[k]])
  );
}
