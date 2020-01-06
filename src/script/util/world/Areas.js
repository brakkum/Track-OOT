import GlobalData from "/script/storage/GlobalData.js";
import AbstractElement from "/deepJS/util/logic/elements/AbstractElement.js";
import EventBus from "/deepJS/util/events/EventBus.js";

import "/script/ui/locations/listitems/Area.js";
import "/script/ui/map/marker/Area.js";

const CHILD = new WeakMap();
const ADULT = new WeakMap();
const LIST_ITEMS = new WeakMap();
const MAP_MARKERS = new WeakMap();

class Area {

    constructor(ref, data) {
        // UI
        let listItem = document.createElement('ootrt-list-area');
        listItem.ref = ref;

        let mapItem = document.createElement('ootrt-marker-area');
        mapItem.ref = ref;

        LIST_ITEMS.set(this, listItem);
        MAP_MARKERS.set(this, mapItem);
    }

    visible() {
        return true;
    }

    child() {
        return true;
    }

    adult() {
        return true;
    }

    get listItem() {
        return LIST_ITEMS.get(this);
    }

    get mapMarker() {
        return MAP_MARKERS.get(this);
    }

}

const AREAS = new Map();

class Areas {

    constructor() {
        let data = GlobalData.get(`world/areas`);
        for (let i in data) {
            if (data[i].type != "") {
                AREAS.set(i, new Area(i, data[i]));
            }
        }
    }

    get(ref) {
        if (!AREAS.has(ref)) {
            debugger;
        }
        return AREAS.get(ref);
    }

}

export default new Areas();