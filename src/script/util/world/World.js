import FileData from "/emcJS/storage/FileData.js";

import MarkerEntry from "./MarkerEntry.js";
import MarkerRegistry from "./MarkerRegistry.js";
import ExitEntry from "./ExitEntry.js";
import ExitRegistry from "./ExitRegistry.js";

let initialized = false;

class World {

    init() {
        if (!initialized) {
            initialized = true;
            const marker = FileData.get("world/marker");
            for (const cat in marker) {
                const entities = marker[cat];
                for (const ref in entities) {
                    const entry = entities[ref];
                    const id = `${cat}/${ref}`;
                    MarkerRegistry.set(id, new MarkerEntry(id, cat, entry));
                }
            }
            const exits = FileData.get("world/exit");
            for (const ref in exits) {
                const entry = exits[ref];
                ExitRegistry.set(ref, new ExitEntry(ref, entry));
            }
        }
    }

}

export default new World();
