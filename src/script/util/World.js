import GlobalData from "/emcJS/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/util/events/EventBus.js";

import ListArea from "/script/ui/locations/listitems/Area.js";
import ListEntrance from "/script/ui/locations/listitems/Entrance.js";
import ListLocation from "/script/ui/locations/listitems/Location.js";
import "/script/ui/locations/listitems/Gossipstone.js";

import MapArea from "/script/ui/map/marker/Area.js";
import MapEntrance from "/script/ui/map/marker/Entrance.js";
import MapLocation from "/script/ui/map/marker/Location.js";
import "/script/ui/map/marker/Gossipstone.js";

const REF = new WeakMap();
const ACCESS = new WeakMap();
const CATEGORY = new WeakMap();
const TYPE = new WeakMap();
const VISIBLE = new WeakMap();
const FILTER = new WeakMap();
const LIST_ITEMS = new WeakMap();
const MAP_MARKERS = new WeakMap();

function valueGetter(key) {
    return this.get(key);
}

function mapToObj(map) {
    let res = {};
    map.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

class WorldEntry {

    constructor(ref, data) {
        let visible_logic = null;
        let filter_logics = new Map();
        let filter_values = new Map();
        REF.set(this, ref);
        ACCESS.set(this, data.access);
        FILTER.set(this, filter_values);
        CATEGORY.set(this, data.category);
        TYPE.set(this, data.type);

        /* LOGIC */
        if (typeof data.visible == "object") {
            visible_logic = LogicCompiler.compile(data.visible);
            VISIBLE.set(this, false);
        } else {
            VISIBLE.set(this, !!data.visible);
        }
        if (!!data.filter) {
            for (let i in data.filter) {
                for (let j in data.filter[i]) {
                    if (typeof data.filter[i][j] == "object") {
                        filter_logics.set(`${i}/${j}`, LogicCompiler.compile(data.filter[i][j]));
                        filter_values.set(`${i}/${j}`, false);
                    } else {
                        filter_values.set(`${i}/${j}`, !!data.filter[i][j]);
                    }
                }
            }
        }

        /* EVENTS */
        EventBus.register(["state", "randomizer_options"], event => {
            let data = new Map(Object.entries(event.data));
            if (typeof visible_logic == "function") {
                VISIBLE.set(this, !!visible_logic(valueGetter.bind(data)));
            }
            filter_logics.forEach((logicFn, key) => {
                if (typeof logicFn == "function") {
                    let res = !!logicFn(valueGetter.bind(data));
                    filter_values.set(key, res);
                }
            });
            if (LIST_ITEMS.has(this)) {
                LIST_ITEMS.get(this).setFilterData(mapToObj(filter_values));
            }
            if (MAP_MARKERS.has(this)) {
                MAP_MARKERS.get(this).setFilterData(mapToObj(filter_values));
            }
        });
    }

    visible() {
        let visible = !!VISIBLE.get(this);
        return visible && this.filtered();
    }

    access() {
        return ACCESS.get(this);
    }

    filtered() {
        let activeFilter = MemoryStorage.get("active_filter", {});
        let values = FILTER.get(this);
        for (let filter in activeFilter) {
            let value = activeFilter[filter];
            if (!!value && !values.get(`${filter}/${value}`)) {
                return false; 
            }
        }
        return true;
    }

    get listItem() {
        if (!LIST_ITEMS.has(this)) {
            let values = FILTER.get(this);
            let listItem = null;
            let category = CATEGORY.get(this);
            let type = TYPE.get(this);
            if (category == "area" && type != "") {
                listItem = new ListArea();
            } else if (category == "entrance") {
                listItem = new ListEntrance();
            } else {
                listItem = ListLocation.createType(type);
            }
            listItem.access = ACCESS.get(this);
            listItem.ref = REF.get(this);
            listItem.setFilterData(mapToObj(values));
            LIST_ITEMS.set(this, listItem);
            return listItem;
        }
        return LIST_ITEMS.get(this);
    }

    get mapMarker() {
        if (!MAP_MARKERS.has(this)) {
            let values = FILTER.get(this);
            let mapItem = null;
            let category = CATEGORY.get(this);
            let type = TYPE.get(this);
            if (category == "area" && type != "") {
                mapItem = new MapArea();
            } else if (category == "entrance") {
                mapItem = new MapEntrance();
            } else {
                mapItem = MapLocation.createType(type);
                // LEGACY
                if (type == "skulltula") {
                    mapItem.dataset.mode = "skulltulas";
                } else if (type == "gossipstone") {
                    mapItem.dataset.mode = "gossipstones";
                } else {
                    mapItem.dataset.mode = "chests";
                }
            }
            mapItem.access = ACCESS.get(this);
            mapItem.ref = REF.get(this);
            mapItem.setFilterData(mapToObj(values));
            MAP_MARKERS.set(this, mapItem);
            return mapItem;
        }
        return MAP_MARKERS.get(this);
    }

}

const WORLD = new Map();
let initialized = false;

class World {

    init() {
        if (!initialized) {
            initialized = true;
            let world = GlobalData.get("world");
            for (let ref in world) {
                let entry = world[ref];
                WORLD.set(ref, new WorldEntry(ref, entry));
            }
        }
    }

    getLocation(ref) {
        return WORLD.get(ref);
    }

}

export default new World();