import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/logic/Logic.js";

let entrance_shuffle = "entrance_shuffle_off";
let exit_binding = {};

// register event on exit target change
EventBus.register("statechange_exits", event => {
    let exits = FileData.get("world/exit");
    let changes = [];
    for (let edgeThere in event.data) {
        let edgeBack = event.data[edgeThere].newValue;
        let [source, target] = edgeThere.split(" -> ");
        let [reroute, entrance] = edgeBack.split(" -> ");
        let edgeThereData = exits[edgeThere];
        if (edgeThereData == null) {
            edgeThereData = exits[`${target} -> ${source}`];
        }
        if (edgeThereData == null) {
            console.error(`missing exit: ${target} -> ${source}`);
        } else {
            let edgeBackData = exits[edgeBack];
            if ((edgeBackData == null || edgeThereData.type == edgeBackData.type) && edgeThereData.active.indexOf(entrance_shuffle) >= 0) {
                if (exit_binding[edgeThere] != reroute) {
                    changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                    changes.push({source: `${reroute}[child]`, target: `${entrance}[child]`, reroute: `${source}[child]`});
                    changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
                    changes.push({source: `${reroute}[adult]`, target: `${entrance}[adult]`, reroute: `${source}[adult]`});
                    exit_binding[edgeThere] = reroute;
                    exit_binding[edgeBack] = source;
                    StateStorage.writeExtra("exits", edgeBack, edgeThere);
                }
            }
        }
    }
    if (!!changes.length) {
        Logic.setTranslation(changes, "region.root");
    }
});

// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    if (event.data.hasOwnProperty("option.entrance_shuffle") && entrance_shuffle != event.data["option.entrance_shuffle"]) {
        entrance_shuffle = event.data["option.entrance_shuffle"];
        update();
    }
});

async function update() {
    let exits = FileData.get("world/exit");
    let changes = [];
    for (let exit in exit_binding) {
        let [source, target] = exit.split(" -> ");
        let edgeData = exits[exit];
        if (edgeData == null) {
            edgeData = exits[`${target} -> ${source}`];
        }
        if (edgeData != null) {
            if (edgeData.active.indexOf(entrance_shuffle) >= 0) {
                let reroute = exit_binding[exit];
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
        Logic.setTranslation(changes, "region.root");
    }
}

class AugmentExits {

    async init() {
        let exits = StateStorage.getAllExtra("exits");
        for (let exit in exits) {
            exit_binding[exit] = exits[exit].split(" -> ")[0]
        }
        entrance_shuffle = StateStorage.read("option.entrance_shuffle");
        await update();
    }

}

export default new AugmentExits();