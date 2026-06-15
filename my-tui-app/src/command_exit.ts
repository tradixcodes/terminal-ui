import { type State } from "./state.js"

const blue = "\x1b[34m";
const reset = "\x1b[0m";

export async function commandExit(state: State, ...args: string[]): Promise<void>{
  console.log(`${blue}Closing the Pokedex... Goodbye!${reset}`);
  window.close(); // closes the Tauri window instead of the readline
}
