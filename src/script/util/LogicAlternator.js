import GlobalData from "/emcJS/storage/GlobalData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/Logic.js";

// TODO add custom logic

let values = {
    entrance_active: {
        "dungeon": false
    },
    entrance_types: {
        "option.entrance_shuffle_dungeons": "dungeon"
    },
    default_logic: {
        "dungeon": {}
    },
    entrance_logic: {
        "dungeon": {}
    },
    entrance_binding: {}
}

class LogicAlternator {

    constructor() {
        EventBus.register("entrance", event => {
            let world = GlobalData.get("world", {});
            let entrance = world[event.data.name];
            let logic = {};
            if (values.entrance_binding[event.data.name] != "") {
                let area = world[values.entrance_binding[event.data.name]];
                let buf = {
                    "type": "false"
                };
                values.entrance_logic[entrance.type][area.access] = buf;
                logic[area.access] = buf;
            }
            if (event.data.value != "") {
                let area = world[event.data.value];
                let buf = {
                    "type": "number",
                    "el": entrance.access,
                    "category": "entrance"
                };
                values.entrance_logic[entrance.type][area.access] = buf;
                logic[area.access] = buf;
            }
            if (values.entrance_active[entrance.type]) {
                Logic.setLogic(logic);
            }
        });
        EventBus.register("randomizer_options", event => {
            let entrance_types = Object.keys(values.entrance_types);
            for (let type of entrance_types) {
                let name = values.entrance_types[type];
                if (event.data.hasOwnProperty(type) && values.entrance_active[name] != event.data[type]) {
                    values.entrance_active[name] = event.data[type];
                    if (values.entrance_active[name]) {
                        Logic.setLogic(values.entrance_logic[name]);
                    } else {
                        Logic.setLogic(values.default_logic[name]);
                    }
                }
            }
        });
    }

    async init() {
        let world = GlobalData.get("world", {});
        for (let name in world) {
            let entry = world[name];
            if (entry.category == "area") {
                if (values.default_logic.hasOwnProperty(entry.type)) {
                    let randoLogic = GlobalData.get(`logic/${entry.access}`, {
                        "type": "false"
                    });
                    values.default_logic[entry.type][entry.access] = randoLogic;
                    if (!values.entrance_logic[entry.type].hasOwnProperty(entry.access)) {
                        values.entrance_logic[entry.type][entry.access] = {
                            "type": "false"
                        };
                    }
                }
            } else if (entry.category == "entrance") {
                if (values.entrance_logic.hasOwnProperty(entry.type)) {
                    let entrance = world[name];
                    let key = StateStorage.read(name, "");
                    values.entrance_binding[name] = key;
                    if (key != "") {
                        let area = world[key];
                        values.entrance_logic[entry.type][area.access] = {
                            "type": "number",
                            "el": entrance.access,
                            "category": "entrance"
                        };
                    }
                }
            }
        }
        // load entrance_active configuration
        for (let type in values.entrance_types) {
            let name = values.entrance_types[type];
            values.entrance_active[name] = StateStorage.read(type, "");
            if (values.entrance_active[name]) {
                Logic.setLogic(values.entrance_logic[name]);
            } else {
                Logic.setLogic(values.default_logic[name]);
            }
        }
    }

}

export default new LogicAlternator();