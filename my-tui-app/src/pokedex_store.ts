import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import type { Pokemon } from "./pokeapi.js";

const POKEDEX_FILE = "pokedex.json";

// load pokedex from disk on startup
export async function loadPokedex(): Promise<Record<string, Pokemon>> {
  try {
    const fileExists = await exists(POKEDEX_FILE, {
      baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return {}; // no save file yet -> fresh start

    const contents = await readTextFile(POKEDEX_FILE, {
      baseDir: BaseDirectory.AppData,
    });

    return JSON.parse(contents) as Record<string, Pokemon>;
  } catch (error) {
    console.log("Could not load pokedex - starting fresh.");
    return {};
  }
}

// save pokedex to disk after every catch
export async function savePokedex(pokedex: Record<string, Pokemon>): Promise<void> {
  try {
    // create the AppData directory if it doesn't exist yet
    await mkdir("", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    await writeTextFile(POKEDEX_FILE, JSON.stringify(pokedex, null, 2), {
      baseDir: BaseDirectory.AppData,
    });
  } catch (error) {
    console.log("Could not save pokedex.");
  }
}

// BaseDirectory.AppData resolves to:
//   Linux   → ~/.local/share/com.tradix.pokedex/pokedex.json
//   Windows → C:\Users\<user>\AppData\Roaming\com.tradix.pokedex\pokedex.json
//  macOS   → ~/Library/Application Support/com.tradix.pokedex/pokedex.json
