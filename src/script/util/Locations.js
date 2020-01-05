import GlobalData from "/script/storage/GlobalData.js";
import AbstractElement from "/deepJS/util/logic/elements/AbstractElement.js";
import EventBus from "/deepJS/util/events/EventBus.js";

import "/script/ui/locations/listitems/Chest.js";
import "/script/ui/locations/listitems/Skulltula.js";
import "/script/ui/locations/listitems/Gossipstone.js";
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

class Location {

    constructor(ref, data) {
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
        let listItem = null;
        let mapItem = null;
        switch (data.type) {
            case "chest":
            case "cow":
            case "scrub":
            case "bean":
                // LIST
                listItem = document.createElement('ootrt-listchest');
                listItem.ref = ref;
                // MAP
                mapItem = document.createElement('ootrt-marker-chest');
                mapItem.ref = ref;
                mapItem.mode = "chests";
                break;
            case "skulltula":
                // LIST
                listItem = document.createElement('ootrt-listskulltula');
                listItem.ref = ref;
                // MAP
                mapItem = document.createElement('ootrt-marker-skulltula');
                mapItem.ref = ref;
                mapItem.mode = "skulltulas";
                break;
            case "gossipstone":
                // LIST
                listItem = document.createElement('ootrt-listgossipstone');
                // MAP
                mapItem = document.createElement('ootrt-marker-gossipstone');
                mapItem.mode = "gossipstones";
                break;
        }

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

        listItem.access = data.access;
        listItem.time = data.time;
        listItem.ref = ref;
        mapItem.access = data.access;
        mapItem.time = data.time;
        mapItem.ref = ref;
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

const LOCATIONS = new Map();

class Locations {

    constructor() {
        let data = GlobalData.get(`world/locations`);
        for (let i in data) {
            LOCATIONS.set(i, new Location(i, data[i]));
        }
    }

    get(ref) {
        return LOCATIONS.get(ref);
    }

}

export default new Locations();