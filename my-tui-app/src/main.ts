import { initState } from "./state.js";

const input = document.getElementById("cmd-input") as HTMLInputElement;
const output = document.getElementById("output-area") as HTMLDivElement;

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

  for (const [code, cls] of Object.entries(ansiClassMap)) {
    if (text.includes(code)) {
      if (cls) cssClass = cls; // use the first color class found
      text = text.replaceAll(code, ""); // strip the code from text
    }
  }

  return { text, cssClass };
}

function print(raw: string, forceClass?: string): void {
  const { text, cssClass } = parseAnsi(raw);
  const line = document.createElement("div");
  line.className = `line ${forceClass ?? cssClass}`;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight; // auto scroll to bottom
}

function printBlank(): void {
  const line = document.createElement("div");
  line.className = "line blank";
  output.appendChild(line);
}

console.log = (...args: unknown[]) => {
  const text = args.join(" ");
  if(!text.trim()){
    printBlank();
  } else {
    print(text);
  }
};

const history: string[] = [];
let historyIndex = -1;

input.addEventListener("keydown", async (e: KeyboardEvent) => {
  
  // up arrow - go back in history
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    }
    return;
  }

  // down arrow - go forward in history
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex > 0){
      historyIndex--;
      input.value = history[historyIndex];
    } else {
      historyIndex = -1;
      input.value = "";
    }
    return;
  }

  if (e.key !== "Enter") return;

  const raw = input.value.trim();
  if (!raw) return;

  history.unshift(raw);
  historyIndex = -1;

  // echo what the user typed
  const echo = document.createElement("div");
  echo.className = "line echo";
  echo.innerHTML = `<span class="prompt">user@pokedex <span class="prompt-path">~</span> $&nbsp;</span>${raw}`;
  output.appendChild(echo);
  output.scrollTop = output.scrollHeight;

  input.value = "";

  // parse command and args
  const parts = raw.trim().toLowerCase().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  const command = state.commands[commandName];

  if (command) {
    try {
      await command.callback(state, ...args);
    } catch (err) {
      print(`Error: ${err}`, "error");
    }
  } else {
    print(`Unknown command: ${commandName}`, "error");
  }

  printBlank(); // blank line after every command for breathing room
});

print("Welcome to the Pokedex!", "info");
print("Type 'help' to see available commands.");
printBlank();
