import GlobalData from "/emcJS/storage/GlobalData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import Logic from "/script/util/Logic.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

// TODO add custom logic

let entrance_active = {
    "dungeon": false
};
let entrance_types = {
    "option.entrance_shuffle_dungeons": "dungeon"
};
let entrance_logic = {
    "dungeon": {}
};
let entrance_binding = {};
let use_custom_logic = false;

// register event on entrances change
EventBus.register("entrance", event => {
    let world = GlobalData.get("world", {});
    let entrance = world[event.data.name];
    let logic = {};
    if (entrance_binding[event.data.name] != "") {
        let area = world[entrance_binding[event.data.name]];
        let buf = {
            "type": "false"
        };
        entrance_logic[entrance.type][area.access] = buf;
        logic[area.access] = buf;
    }
    if (event.data.value != "") {
        let area = world[event.data.value];
        let buf = {
            "type": "number",
            "el": entrance.access,
            "category": "entrance"
        };
        entrance_logic[entrance.type][area.access] = buf;
        logic[area.access] = buf;
    }
    if (entrance_active[entrance.type]) {
        Logic.setLogic(logic);
    }
});
// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    let changed = false;
    for (let type in entrance_types) {
        let name = entrance_types[type];
        if (event.data.hasOwnProperty(type) && entrance_active[name] != event.data[type]) {
            entrance_active[name] = event.data[type];
            changed = true;
        }
    }
    if (changed) {
        updateLogic();
    }
});
// register event for (de-)activate custom logic
EventBus.register("settings", async event => {
    if (event.data.hasOwnProperty('use_custom_logic')) {
        if (use_custom_logic != event.data.use_custom_logic) {
            use_custom_logic = event.data.use_custom_logic;
            updateLogic();
        }
    }
});
// register event for changing custom logic
EventBus.register("custom_logic", async event => {
    // TODO make logic editor fire this event on logic changed if you exit editor
    if (use_custom_logic) {
        updateLogic();
    }
});

async function updateLogic() {
    let logic = GlobalData.get("logic", {});
    if (use_custom_logic) {
        let customLogic = await LogicsStorage.getAll();
        for (let l of customLogic) {
            logic[l] = customLogic[l];
        }
    }
    for (let type in entrance_types) {
        let name = entrance_types[type];
        if (entrance_active[name]) {
            for (let l in entrance_logic[name]) {
                logic[l] = entrance_logic[name][l];
            }
        }
    }
    Logic.setLogic(logic);
}

class LogicAlternator {

    async init() {
        let settings = GlobalData.get("settings", {});
        let world = GlobalData.get("world", {});
        for (let type in entrance_types) {
            let name = entrance_types[type];
            entrance_active[name] = StateStorage.read(type, "");
        }
        for (let name in world) {
            let entry = world[name];
            if (entry.category == "area") {
                if (entrance_logic.hasOwnProperty(entry.type)) {
                    if (!entrance_logic[entry.type].hasOwnProperty(entry.access)) {
                        entrance_logic[entry.type][entry.access] = {
                            "type": "false"
                        };
                    }
                }
            } else if (entry.category == "entrance") {
                if (entrance_logic.hasOwnProperty(entry.type)) {
                    let entrance = world[name];
                    let key = StateStorage.read(name, "");
                    entrance_binding[name] = key;
                    if (key != "") {
                        let area = world[key];
                        entrance_logic[entry.type][area.access] = {
                            "type": "number",
                            "el": entrance.access,
                            "category": "entrance"
                        };
                    }
                }
            }
        }
        use_custom_logic = await SettingsStorage.get("use_custom_logic", settings["use_custom_logic"].default);
        await updateLogic();
    }

}

export default new LogicAlternator();