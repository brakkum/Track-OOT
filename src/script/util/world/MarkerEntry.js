import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

import ListArea from "/script/ui/world/listitems/Area.js";
import ListSubArea from "/script/ui/world/listitems/SubArea.js";
import ListExit from "/script/ui/world/listitems/Exit.js";
import ListSubExit from "/script/ui/world/listitems/SubExit.js";
import ListLocation from "/script/ui/world/listitems/Location.js";
import "/script/ui/world/listitems/Gossipstone.js";

import MapArea from "/script/ui/world/mapmarker/Area.js";
import MapSubArea from "/script/ui/world/mapmarker/SubArea.js";
import MapExit from "/script/ui/world/mapmarker/Exit.js";
import MapSubExit from "/script/ui/world/mapmarker/SubExit.js";
import MapLocation from "/script/ui/world/mapmarker/Location.js";
import "/script/ui/world/mapmarker/Gossipstone.js";

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
    const res = {};
    map.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

function createListItem(category, instance) {
    let res = null;
    const values = FILTER.get(instance);
    const type = TYPE.get(instance);
    if (category == "area" && type != "") {
        res = new ListArea();
    } else if (category == "subarea") {
        res = new ListSubArea();
    } else if (category == "exit") {
        res = new ListExit();
    } else if (category == "subexit") {
        res = new ListSubExit();
    } else {
        res = ListLocation.createType(type);
    }
    res.setFilterData(mapToObj(values));
    res.access = ACCESS.get(instance);
    res.ref = REF.get(instance);
    return res;
}

function createMapItem(category, instance) {
    let res = null;
    const values = FILTER.get(instance);
    const type = TYPE.get(instance);
    if (category == "area" && type != "") {
        res = new MapArea();
    } else if (category == "subarea") {
        res = new MapSubArea();
    } else if (category == "exit") {
        res = new MapExit();
    } else if (category == "subexit") {
        res = new MapSubExit();
    } else {
        res = MapLocation.createType(type);
        // LEGACY
        if (type == "skulltula") {
            res.dataset.mode = "filter.skulltulas";
        } else if (type == "gossipstone") {
            res.dataset.mode = "filter.gossipstones";
        } else {
            res.dataset.mode = "filter.chests";
        }
    }
    res.access = ACCESS.get(instance);
    res.ref = REF.get(instance);
    res.setFilterData(mapToObj(values));
    return res;
}

export default class MarkerEntry {

    constructor(ref, category, data) {
        let visible_logic = null;
        const filter_logics = new Map();
        const filter_values = new Map();
        REF.set(this, ref);
        ACCESS.set(this, data.access);
        FILTER.set(this, filter_values);
        CATEGORY.set(this, category);
        TYPE.set(this, data.type);

        const stored_data = new Map(Object.entries(StateStorage.getAll()));

        /* LOGIC */
        if (typeof data.visible == "object") {
            visible_logic = LogicCompiler.compile(data.visible);
            VISIBLE.set(this, !!visible_logic(valueGetter.bind(stored_data)));
        } else {
            VISIBLE.set(this, !!data.visible);
        }
        if (!!data.filter) {
            for (let i in data.filter) {
                for (let j in data.filter[i]) {
                    if (typeof data.filter[i][j] == "object") {
                        const logicFn = LogicCompiler.compile(data.filter[i][j]);
                        filter_logics.set(`${i}/${j}`, logicFn);
                        const res = !!logicFn(valueGetter.bind(stored_data));
                        filter_values.set(`${i}/${j}`, res);
                    } else {
                        filter_values.set(`${i}/${j}`, !!data.filter[i][j]);
                    }
                }
            }
        }

        /* EVENTS */
        const calculateFilter = function(data) {
            if (typeof visible_logic == "function") {
                VISIBLE.set(this, !!visible_logic(valueGetter.bind(data)));
            }
            filter_logics.forEach((logicFn, key) => {
                if (typeof logicFn == "function") {
                    const res = !!logicFn(valueGetter.bind(data));
                    filter_values.set(key, res);
                }
            });
            if (LIST_ITEMS.has(this)) {
                LIST_ITEMS.get(this).setFilterData(mapToObj(filter_values));
            }
            if (MAP_MARKERS.has(this)) {
                MAP_MARKERS.get(this).setFilterData(mapToObj(filter_values));
            }
        }.bind(this);
        EventBus.register("state", event => {
            calculateFilter(new Map(Object.entries(event.data.state)));
        });
        EventBus.register("randomizer_options", event => {
            calculateFilter(new Map(Object.entries(event.data)));
        });
    }

    visible() {
        const visible = !!VISIBLE.get(this);
        return visible && this.filtered();
    }

    access() {
        return ACCESS.get(this);
    }

    filtered() {
        const activeFilter = FilterStorage.getAll();
        const values = FILTER.get(this);
        for (const filter in activeFilter) {
            const value = activeFilter[filter];
            const name = `${filter}/${value}`;
            if (!!value && values.has(name)) {
                if (!values.get(name)) {
                    return false; 
                }
            }
        }
        return true;
    }

    get listItem() {
        if (!LIST_ITEMS.has(this)) {
            const category = CATEGORY.get(this);
            const listItem = createListItem(category, this);
            LIST_ITEMS.set(this, listItem);
            return listItem;
        }
        return LIST_ITEMS.get(this);
    }

    get mapMarker() {
        if (!MAP_MARKERS.has(this)) {
            const category = CATEGORY.get(this);
            const mapItem = createMapItem(category, this);
            MAP_MARKERS.set(this, mapItem);
            return mapItem;
        }
        return MAP_MARKERS.get(this);
    }

}