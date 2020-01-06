import GlobalData from "/script/storage/GlobalData.js";
import AbstractElement from "/deepJS/util/logic/elements/AbstractElement.js";
import EventBus from "/deepJS/util/events/EventBus.js";

import "/script/ui/locations/listitems/Entrance.js";
import "/script/ui/map/marker/Entrance.js";

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

class Entrance {

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
        let listItem = document.createElement('ootrt-list-entrance');
        listItem.ref = ref;
        listItem.access = data.access;
        listItem.time = data.time;
        listItem.ref = ref;

        let mapItem = document.createElement('ootrt-marker-entrance');
        mapItem.ref = ref;
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

const ENTRANCES = new Map();

class Entrances {

    constructor() {
        let data = GlobalData.get(`world/entrances`);
        for (let i in data) {
            ENTRANCES.set(i, new Entrance(i, data[i]));
        }
    }

    get(ref) {
        if (!ENTRANCES.has(ref)) {
            debugger;
        }
        return ENTRANCES.get(ref);
    }

}

export default new Entrances();