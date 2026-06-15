import { initState } from "./state.js";

const input = document.getElementById("cmd-input") as HTMLInputElement;
const output = document.getElementById("output-area") as HTLMDivElement;

const state = initState();

const ansiClassMap: Record<string, string> = {
  "\x1b[31m": "error",    // red
  "\x1b[32m": "success",  // green
  "\x1b[33m": "warn",     // yellow
  "\x1b[34m": "info",     // blue
  "\x1b[36m": "info",     // cyan
  "\x1b[1m": "",          // bold - ignored, handled by CSS if needed
  "\x1b[0m": "",          // green
};

function parseAnsi(raw: string): { text: string; cssClass: string } {
  let cssClass = "output"; // default class
  let text = raw;
}
