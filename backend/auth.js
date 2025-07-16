
import { getConfig } from './configLoader.js'


// NEW (after importing getConfig)
const { password } = await getConfig();


export function validatePassword(input) {
  // Simple hardcoded password for now
  return input === password;
}
