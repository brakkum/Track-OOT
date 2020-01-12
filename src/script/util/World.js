import GlobalData from "/script/storage/GlobalData.js";
import AbstractElement from "/emcJS/util/logic/elements/AbstractElement.js";
import EventBus from "/emcJS/util/events/EventBus.js";

import "/script/ui/locations/listitems/Area.js";
import "/script/ui/locations/listitems/Entrance.js";
import "/script/ui/locations/listitems/Location.js";
import "/script/ui/locations/listitems/Chest.js";
import "/script/ui/locations/listitems/Skulltula.js";
import "/script/ui/locations/listitems/Gossipstone.js";

import "/script/ui/map/marker/Area.js";
import "/script/ui/map/marker/Entrance.js";
import "/script/ui/map/marker/Location.js";
import "/script/ui/map/marker/Chest.js";
import "/script/ui/map/marker/Skulltula.js";
import "/script/ui/map/marker/Gossipstone.js";

const VISIBLE = new WeakMap();
const CHILD = new WeakMap();
const ADULT = new WeakMap();
const LIST_ITEMS = new WeakMap();
const MAP_MARKERS = new WeakMap();

function fnTrue() {
    return true;
}
function fnFalse() {
    return false;
}

class WorldEntry {

    constructor(type, ref, data) {
        if (type == "location") {
            
        }
        // LOGIC
        if (typeof data.visible == "object") {
            VISIBLE.set(this, new Function('values', `return ${AbstractElement.buildLogic(data.visible)}`));
        } else {
            VISIBLE.set(this, !!data.visible ? fnTrue : fnFalse);
        }
        if (typeof data.child == "object") {
            CHILD.set(this, new Function('values', `return ${AbstractElement.buildLogic(data.child)}`));
        } else {
            CHILD.set(this, !!data.child ? fnTrue : fnFalse);
        }
        if (typeof data.adult == "object") {
            ADULT.set(this, new Function('values', `return ${AbstractElement.buildLogic(data.adult)}`));
        } else {
            ADULT.set(this, !!data.adult ? fnTrue : fnFalse);
        }
        // UI
        let listItem = document.createElement(`ootrt-list-${type}`);
        listItem.access = data.access;
        listItem.time = data.time;
        listItem.ref = ref;

        let mapItem = document.createElement(`ootrt-marker-${type}`);
        mapItem.access = data.access;
        mapItem.time = data.time;
        mapItem.ref = ref;

        if (!!data.child && !!data.adult) {
            listItem.era = "both";
            mapItem.era = "both";
        } else if (!!data.child) {
            listItem.era = "child";
            mapItem.era = "child";
        } else if (!!data.adult) {
            listItem.era = "adult";
            mapItem.era = "adult";
        } else {
            listItem.era = "none";
            mapItem.era = "none";
        }

        LIST_ITEMS.set(this, listItem);
        MAP_MARKERS.set(this, mapItem);

        EventBus.register("settings", event => {
            let values = new Map(Object.entries(event.data));

            let child = this.child(values);
            let adult = this.adult(values);

            if (!!child && !!adult) {
                listItem.era = "both";
                mapItem.era = "both";
            } else if (!!child) {
                listItem.era = "child";
                mapItem.era = "child";
            } else if (!!adult) {
                listItem.era = "adult";
                mapItem.era = "adult";
            } else {
                listItem.era = "none";
                mapItem.era = "none";
            }

        });
    }

    visible(data) {
        return VISIBLE.get(this)(new Map(Object.entries(data)));
    }

    child(data) {
        return CHILD.get(this)(new Map(Object.entries(data)));
    }

    adult(data) {
        return ADULT.get(this)(new Map(Object.entries(data)));
    }

    get listItem() {
        return LIST_ITEMS.get(this);
    }

    get mapMarker() {
        return MAP_MARKERS.get(this);
    }

}

const REG = new Map();
const WORLD = new Map();

export default class World {

    constructor() {
        let area = GlobalData.get(`world/areas`);
        for (let i in area) {
            if (area[i].type != "") {
                WORLD.set(i, new WorldEntry("area", i, area[i]));
            }
        }
        let entrance = GlobalData.get(`world/entrances`);
        for (let i in entrance) {
            WORLD.set(i, new WorldEntry("entrance", i, entrance[i]));
        }
        let locations = GlobalData.get(`world/locations`);
        for (let i in locations) {
            WORLD.set(i, new WorldEntry("location", i, locations[i]));
        }
    }

    get(ref) {
        return WORLD.get(ref);
    }

    static registerType(ref, clazz) {
        if (REG.has(ref)) {
            throw new Error(`location type ${ref} already exists`);
        }
        REG.set(ref, clazz);
    }

    static getType(...refs) {
        for (let ref of refs) {
            if (REG.has(ref)) {
                return REG.get(ref);
            }
        }
        return "";
    }

}

new World();