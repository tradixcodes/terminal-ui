// ── Tauri ─────────────────────────────────────────────────────────────────────
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";

const appWindow = getCurrentWindow();

// ── Types ────────────────────────────────────────────────────────────────────

type LineType = "output" | "success" | "error" | "info" | "warn" | "echo" | "blank";

interface Command {
  description: string;
  run: (args: string[]) => void;
}

// ── State ─────────────────────────────────────────────────────────────────────

const cmdHistory: string[] = [];
let historyIndex = -1;

// ── DOM refs ──────────────────────────────────────────────────────────────────

const outputArea  = document.getElementById("output-area")!;
const cmdInput    = document.getElementById("cmd-input") as HTMLInputElement;

// ── Output helpers ────────────────────────────────────────────────────────────

function printLine(text: string, type: LineType = "output"): void {
  const el = document.createElement("div");
  el.classList.add("line", type);
  el.textContent = text;
  outputArea.appendChild(el);
  outputArea.scrollTop = outputArea.scrollHeight;
}

function printHTML(html: string, type: LineType = "output"): void {
  const el = document.createElement("div");
  el.classList.add("line", type);
  el.innerHTML = html;
  outputArea.appendChild(el);
  outputArea.scrollTop = outputArea.scrollHeight;
}

function printBlank(): void {
  const el = document.createElement("div");
  el.classList.add("line", "blank");
  outputArea.appendChild(el);
}

function echoCommand(raw: string): void {
  printHTML(
    `<span class="prompt">user@tui-app <span class="prompt-path">~</span> $&nbsp;</span>${escapeHtml(raw)}`,
    "echo"
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Command registry ──────────────────────────────────────────────────────────

const commands: Record<string, Command> = {
  help: {
    description: "List all available commands",
    run: () => {
      printBlank();
      printLine("Available commands:", "info");
      for (const [name, cmd] of Object.entries(commands)) {
        printLine(`  ${name.padEnd(14)} ${cmd.description}`, "output");
      }
      printBlank();
    },
  },

  clear: {
    description: "Clear the terminal output",
    run: () => {
      outputArea.innerHTML = "";
    },
  },

  echo: {
    description: "Print text  — usage: echo <text>",
    run: (args) => {
      printLine(args.join(" ") || "", "output");
    },
  },

  date: {
    description: "Print the current date and time",
    run: () => {
      printLine(new Date().toLocaleString(), "success");
    },
  },

  about: {
    description: "About this app",
    run: () => {
      printBlank();
      printLine("  TUI App — built with Tauri + Vanilla TS", "info");
      printLine("  A terminal-style desktop app.", "output");
      printLine("  Type 'help' to see all commands.", "output");
      printBlank();
    },
  },

  theme: {
    description: "Switch accent color — usage: theme <green|cyan|yellow|red|blue>",
    run: (args) => {
      const map: Record<string, string> = {
        green:  "#7ecb8f",
        cyan:   "#60c8d4",
        yellow: "#e2c97e",
        red:    "#e27e7e",
        blue:   "#7eaae2",
      };
      const color = map[args[0]];
      if (!color) {
        printLine(`Unknown theme. Options: ${Object.keys(map).join(", ")}`, "error");
        return;
      }
      document.documentElement.style.setProperty("--prompt", color);
      document.documentElement.style.setProperty("--cursor", color);
      printLine(`Theme set to ${args[0]}.`, "success");
    },
  },

  exit: {
    description: "Quit the app",
    run: async () => {
      printLine("Goodbye.", "warn");
      setTimeout(() => exit(0), 300);
    },
  },
};

// ── Command runner ────────────────────────────────────────────────────────────

function runCommand(raw: string): void {
  const trimmed = raw.trim();
  if (!trimmed) return;

  cmdHistory.unshift(trimmed);
  historyIndex = -1;

  echoCommand(trimmed);

  const [name, ...args] = trimmed.split(/\s+/);
  const cmd = commands[name.toLowerCase()];

  if (cmd) {
    cmd.run(args);
  } else {
    printLine(`command not found: ${name}`, "error");
    printLine(`Type 'help' to see available commands.`, "info");
  }

  printBlank();
}

// ── Input handling ────────────────────────────────────────────────────────────

cmdInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    const val = cmdInput.value;
    cmdInput.value = "";
    runCommand(val);
  }

  if (e.key === "Escape") {
    appWindow.setFullscreen(false);
    appWindow.setSize({ type: "Logical", width: 800, height: 600 } as any);
    appWindow.center();
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex < cmdHistory.length - 1) {
      historyIndex++;
      cmdInput.value = cmdHistory[historyIndex];
    }
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      cmdInput.value = cmdHistory[historyIndex];
    } else {
      historyIndex = -1;
      cmdInput.value = "";
    }
  }
});

// Keep input focused when clicking anywhere in the terminal
document.getElementById("terminal")!.addEventListener("click", () => {
  cmdInput.focus();
});

// ── Boot message ──────────────────────────────────────────────────────────────

printLine("Welcome to TUI App.", "success");
printLine("Type 'help' to get started.", "info");
printBlank();
