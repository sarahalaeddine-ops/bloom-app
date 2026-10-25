// Prints the narrator's lines as { key: text } JSON, for scripts/make-voice.py.
// Run with: node --import ./tests/setup/register.mjs scripts/export-voice-lines.mjs
import { filmLines } from "../lib/voice-lines.js";

process.stdout.write(JSON.stringify(Object.fromEntries(filmLines()), null, 1) + "\n");
