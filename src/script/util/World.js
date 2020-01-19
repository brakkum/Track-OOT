import GlobalData from "/script/storage/GlobalData.js";
import LogicProcessor from "/emcJS/util/logic/Processor.js";
import AbstractElement from "/emcJS/util/logic/elements/AbstractElement.js";
import EventBus from "/emcJS/util/events/EventBus.js";

import ListArea from "/script/ui/locations/listitems/Area.js";
import ListEntrance from "/script/ui/locations/listitems/Entrance.js";
import ListLocation from "/script/ui/locations/listitems/Location.js";
import "/script/ui/locations/listitems/Gossipstone.js";

import MapArea from "/script/ui/map/marker/Area.js";
import MapEntrance from "/script/ui/map/marker/Entrance.js";
import MapLocation from "/script/ui/map/marker/Location.js";
import "/script/ui/map/marker/Gossipstone.js";

const VISIBLE = new WeakMap();
const CHILD = new WeakMap();
const ADULT = new WeakMap();
const LIST_ITEMS = new WeakMap();
const MAP_MARKERS = new WeakMap();

function valueGetter(key) {
    return this.get(key);
}

function fnTrue() {
    return true;
}
function fnFalse() {
    return false;
}

class WorldEntry {

    constructor(listItem, mapItem, ref, data) {
        // LOGIC
        if (typeof data.visible == "object") {
            VISIBLE.set(this, new Function('val', `return ${AbstractElement.buildLogic(data.visible)}`));
        } else {
            VISIBLE.set(this, !!data.visible ? fnTrue : fnFalse);
        }
        if (typeof data.child == "object") {
            CHILD.set(this, new Function('val', `return ${AbstractElement.buildLogic(data.child)}`));
        } else {
            CHILD.set(this, !!data.child ? fnTrue : fnFalse);
        }
        if (typeof data.adult == "object") {
            ADULT.set(this, new Function('val', `return ${AbstractElement.buildLogic(data.adult)}`));
        } else {
            ADULT.set(this, !!data.adult ? fnTrue : fnFalse);
        }
        // UI
        listItem.access = data.access;
        listItem.time = data.time;
        listItem.ref = ref;
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

    visible(state) {
        let visible = VISIBLE.get(this);
        return visible(valueGetter.bind(state));
    }

    child(state) {
        let child = CHILD.get(this);
        return child(valueGetter.bind(state));
    }

    adult(state) {
        let adult = ADULT.get(this);
        return adult(valueGetter.bind(state));
    }

    get listItem() {
        return LIST_ITEMS.get(this);
    }

    get mapMarker() {
        return MAP_MARKERS.get(this);
    }

}

const WORLD = new Map();

class World {

    constructor() {
        let area = GlobalData.get(`world/areas`);
        for (let i in area) {
            if (area[i].type != "") {
                let listItem = new ListArea();
                let mapItem = new MapArea();
                WORLD.set(i, new WorldEntry(listItem, mapItem, i, area[i]));
            }
        }
        let entrance = GlobalData.get(`world/entrances`);
        for (let i in entrance) {
            let listItem = new ListEntrance();
            let mapItem = new MapEntrance();
            WORLD.set(i, new WorldEntry(listItem, mapItem, i, entrance[i]));
        }
        let locations = GlobalData.get(`world/locations`);
        for (let i in locations) {
            let listItem = ListLocation.createType(locations[i].type);
            let mapItem = MapLocation.createType(locations[i].type);
            switch (locations[i].type) {
                // LEGACY
                case "chest":
                case "cow":
                case "scrub":
                case "bean":
                    mapItem.dataset.mode = "chests";
                    break;
                case "skulltula":
                    mapItem.dataset.mode = "skulltulas";
                    break;
                case "gossipstone":
                    mapItem.dataset.mode = "gossipstones";
                    break;
            }
            WORLD.set(i, new WorldEntry(listItem, mapItem, i, locations[i]));
        }
    }

    get(ref) {
        return WORLD.get(ref);
    }

}

export default new World();