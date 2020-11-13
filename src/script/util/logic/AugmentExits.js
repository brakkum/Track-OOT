import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/logic/Logic.js";
import ExitRegistry from "/script/util/world/ExitRegistry.js";

const OPTIONS = {
    "option.shuffle_grottos": false,
    "option.shuffle_dungeons": false,
    "option.shuffle_overworld": false,
    "option.shuffle_owl": false,
    "option.shuffle_warps": false,
    "option.shuffle_spawns": false,
    "option.entrance_shuffle_interior": "entrance_shuffle_off"
};
const exit_binding = {};

function applyEntranceChanges(changes, edgeThere, edgeBack) {
    if (exit_binding[edgeThere] == edgeBack) return;
    const exitEntry = ExitRegistry.get(edgeThere);
    if (exitEntry == null) {
        console.error(`missing exit: ${edgeThere}`);
    } else {
        if (!exitEntry.active()) return;
        const [source, target] = edgeThere.split(" -> ");
        const entranceEntry = ExitRegistry.get(edgeBack);
        if (entranceEntry != null) {
            if (!entranceEntry.active() || exitEntry.getType() != entranceEntry.getType()) return;
            const [reroute, entrance] = edgeBack.split(" -> ");
            if (!!exit_binding[edgeThere]) {
                StateStorage.writeExtra("exits", exit_binding[edgeThere], "");
            }
            //if (!!exit_binding[edgeBack]) {
            //    StateStorage.writeExtra("exits", exit_binding[edgeBack], "");
            //}
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
            changes.push({source: `${reroute}[child]`, target: `${entrance}[child]`, reroute: `${source}[child]`});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            changes.push({source: `${reroute}[adult]`, target: `${entrance}[adult]`, reroute: `${source}[adult]`});
            exit_binding[edgeThere] = edgeBack;
            exit_binding[edgeBack] = edgeThere;
            //StateStorage.writeExtra("exits", edgeBack, edgeThere);
        } else {
            //if (!!exit_binding[edgeThere]) {
            //    StateStorage.writeExtra("exits", exit_binding[edgeThere], "");
            //}
            edgeBack = exit_binding[edgeThere];
            const [reroute, entrance] = edgeBack.split(" -> ");
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: "[child]"});
            changes.push({source: `${reroute}[child]`, target: `${entrance}[child]`, reroute: "[child]"});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: "[adult]"});
            changes.push({source: `${reroute}[adult]`, target: `${entrance}[adult]`, reroute: "[adult]"});
            exit_binding[edgeThere] = "";
            exit_binding[edgeBack] = "";
        }
    }
}

async function update() {
    const changes = [];
    for (const exit in exit_binding) {
        if (!exit) continue;
        const exitEntry = ExitRegistry.get(exit);
        if (exitEntry != null) {
            const [source, target] = exit.split(" -> ");
            if (exitEntry.active()) {
                const reroute = exit_binding[exit].split(" -> ")[0];
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            } else {
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${target}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${target}[adult]`});
            }
        } else {
            throw Error("Entrance association error: data may be stale");
        }
    }
    if (!!changes.length) {
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }
}

// register event on state change
EventBus.register("state", event => {
    let changed = false;
    const exits = FileData.get("world/exit");
    for (const exit in exits) {
        if (event.data.extra.exits != null && event.data.extra.exits[exit] != null) {
            const edgeBack = event.data.extra.exits[exit];
            if (exit_binding[exit] != edgeBack) {
                const entrance = exit_binding[exit];
                if (!!entrance) {
                    exit_binding[entrance] = "";
                } 
                exit_binding[exit] = edgeBack;
                exit_binding[edgeBack] = exit;
                changed = true;
            }
        } else if (!!exit_binding[exit]) {
            const back = exit_binding[exit];
            exit_binding[exit] = "";
            exit_binding[back] = "";
            changed = true;
        }
    }
    if (changed) {
        update();
    }
});

// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    let changed = false;
    for (const key in OPTIONS) {
        if (event.data.hasOwnProperty(key) && OPTIONS[key] != event.data[key]) {
            OPTIONS[key] = event.data[key];
            changed = true;
        }
    }
    if (changed) {
        update();
    }
});

// register event on exit target change
EventBus.register("statechange_exits", event => {
    const changes = [];
    for (const edgeThere in event.data) {
        if (!edgeThere) continue;
        const edgeBack = event.data[edgeThere].newValue;
        applyEntranceChanges(changes, edgeThere, edgeBack);
    }
    if (!!changes.length) {
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }
});

class AugmentExits {

    async init() {
        const bound = StateStorage.readAllExtra("exits");
        const exits = FileData.get("world/exit");
        for (const exit in exits) {
            const entrance = bound[exit] || "";
            exit_binding[exit] = entrance;
            if (!!entrance) {
                exit_binding[entrance] = exit;
            }
        }
        for (const key in OPTIONS) {
            OPTIONS[key] = StateStorage.read(key);
        }
        await update();
    }

}

export default new AugmentExits();