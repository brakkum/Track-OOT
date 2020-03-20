
import FileData from "/emcJS/storage/FileData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import Language from "/script/util/Language.js";

const LogicsStorage = new TrackerStorage('logics');

const LOGIC_OPERATORS = [
    "emc-logic-false",
    "emc-logic-true",
    "emc-logic-not",
    "emc-logic-and",
    "emc-logic-nand",
    "emc-logic-or",
    "emc-logic-nor",
    "emc-logic-xor",
    "emc-logic-min",
    "emc-logic-max"
];

class ListUtil {

    async fillLists(loadLogic) {

        let world = FileData.get("world");
        let world_lists = FileData.get("world_lists");
        let items = FileData.get("items");
        let randomizer_options = FileData.get("randomizer_options");
        let filter = FileData.get("filter");
        let logic = FileData.get("logic");
        let custom_logic = await LogicsStorage.getAll();
        let mixins = {};
        
        if (!!logic) {
            for (let i in logic) {
                if (!i.startsWith("mixin.")) continue;
                mixins[i] = logic[i];
            }
        }
        if (!!custom_logic) {
            for (let i in custom_logic) {
                if (!i.startsWith("mixin.")) continue;
                mixins[i] = custom_logic[i];
            }
        }

        let logicContainer = document.getElementById("logics");
        let operatorContainer = document.getElementById("elements");

        // OPERATORS
        operatorContainer.append(createDefaultOperatorCategory());
        operatorContainer.append(createOperatorCategory(items, "item"));
        operatorContainer.append(createOperatorCategory(randomizer_options.options, "option"));
        operatorContainer.append(createOperatorCategory(randomizer_options.skips, "skip"));
        operatorContainer.append(createOperatorCategory(filter, "filter"));
        for (let cat of createOperatorWorldCategories(world)) {
            operatorContainer.append(cat);
        }
        operatorContainer.append(createOperatorMixins(mixins));
        
        // LOGICS
        for (let cat of createLogicWorldCategories(world_lists, world, loadLogic)) {
            logicContainer.append(cat);
        }
        logicContainer.append(createLogicMixinCategory(mixins, loadLogic));

    }

}

export default new ListUtil();

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = Language.translate("default");
    for (let i in LOGIC_OPERATORS) {
        let el = document.createElement(LOGIC_OPERATORS[i]);
        el.template = "true";
        cnt.append(el);
    }
    return cnt;
}

function createOperatorCategory(data, ref) {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = Language.translate(`${ref}`);
    for (let i in data) {
        let opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "list") {
            for (let j of opt.values) {
                let el = document.createElement("tracker-logic-custom");
                el.ref = j;
                el.category = ref;
                el.template = "true";
                el.dataset.filtervalue = Language.translate(el.ref);
                cnt.append(el);
            }
        } else if (opt.type === "choice") {
            for (let j of opt.values) {
                let el = document.createElement("tracker-logic-custom");
                el.ref = i;
                el.value = j;
                el.category = ref;
                el.template = "true";
                el.dataset.filtervalue = Language.translate(el.ref);
                cnt.append(el);
            }
        } else {
            let el = document.createElement("tracker-logic-custom");
            el.ref = i;
            el.category = ref;
            el.template = "true";
            el.dataset.filtervalue = Language.translate(el.ref);
            cnt.append(el);
        }
    }
    return cnt;
}

function createOperatorWorldCategories(world) {
    let cnts = [];

    let els = {
        location: [],
        entrance: [],
        area: []
    };

    for (let name in world) {
        let ref = world[name];
        let el = document.createElement("tracker-logic-custom");
        el.ref = ref.category == "location" ? name : ref.access;
        el.category = ref.category;
        el.template = "true";
        el.dataset.filtervalue = Language.translate(el.ref);
        els[ref.category].push(el);
    }

    if (els.location.length > 0) {
        let cnt_l = document.createElement("emc-collapsepanel");
        cnt_l.caption = 'locations';
        for (let loc of els.location) {
            cnt_l.append(loc);
        }
        cnts.push(cnt_l);
    }

    if (els.area.length > 0) {
        let cnt_a = document.createElement("emc-collapsepanel");
        cnt_a.caption = 'areas';
        for (let loc of els.area) {
            cnt_a.append(loc);
        }
        cnts.push(cnt_a);
    }

    if (els.entrance.length > 0) {
        let cnt_e = document.createElement("emc-collapsepanel");
        cnt_e.caption = 'entrances';
        for (let loc of els.entrance) {
            cnt_e.append(loc);
        }
        cnts.push(cnt_e);
    }

    return cnts;
}

function createOperatorMixins(data) {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = Language.translate("mixin");
    for (let ref in data) {
        let el = document.createElement("tracker-logic-mixin");
        el.ref = ref;
        el.category = "mixin";
        el.template = "true";
        el.dataset.filtervalue = Language.translate(el.ref);
        cnt.append(el);
    }
    return cnt;
}

// LOGICS
// -------------------
function createLogicWorldCategories(data, world, loadLogic) {
    let cnts = [];
    for (let name in data) {
        if (name == "#") continue; 
        let lists = data[name].lists;
        if (name == "") name = "area.overworld";
        let caption = Language.translate(name);
        if (lists.hasOwnProperty("v")) {
            let cnt = document.createElement("emc-collapsepanel");
            cnt.caption = caption;

            let els = {
                location: [],
                entrance: [],
                area: []
            };

            for (let record of lists.v) {
                let ref = world[record.id];
                let el = document.createElement("div");
                el.dataset.ref = ref.access;
                el.dataset.cat = ref.category;
                el.className = "logic-location";
                el.onclick = loadLogic;
                el.innerHTML = Language.translate(record.id);
                el.dataset.filtervalue = el.innerHTML;
                els[ref.category].push(el);
            }

            if (els.location.length > 0) {
                let cnt_l = document.createElement("emc-collapsepanel");
                cnt_l.caption = 'locations';
                for (let loc of els.location) {
                    cnt_l.append(loc);
                }
                cnt.append(cnt_l);
            }

            if (els.area.length > 0) {
                let cnt_a = document.createElement("emc-collapsepanel");
                cnt_a.caption = 'areas';
                for (let loc of els.area) {
                    cnt_a.append(loc);
                }
                cnt.append(cnt_a);
            }

            if (els.entrance.length > 0) {
                let cnt_e = document.createElement("emc-collapsepanel");
                cnt_e.caption = 'entrances';
                for (let loc of els.entrance) {
                    cnt_e.append(loc);
                }
                cnt.append(cnt_e);
            }

            cnts.push(cnt);
        }
        if (lists.hasOwnProperty("mq")) {
            let cnt = document.createElement("emc-collapsepanel");
            cnt.caption = `${caption} MQ`;

            let els = {
                location: [],
                entrance: [],
                area: []
            };

            for (let record of lists.mq) {
                let ref = world[record.id];
                let el = document.createElement("div");
                el.dataset.ref = ref.access;
                el.dataset.cat = ref.category;
                el.className = "logic-location";
                el.onclick = loadLogic;
                el.innerHTML = Language.translate(record.id);
                el.dataset.filtervalue = el.innerHTML;
                els[ref.category].push(el);
            }

            if (els.location.length > 0) {
                let cnt_l = document.createElement("emc-collapsepanel");
                cnt_l.caption = 'locations';
                for (let loc of els.location) {
                    cnt_l.append(loc);
                }
                cnt.append(cnt_l);
            }

            if (els.area.length > 0) {
                let cnt_a = document.createElement("emc-collapsepanel");
                cnt_a.caption = 'areas';
                for (let loc of els.area) {
                    cnt_a.append(loc);
                }
                cnt.append(cnt_a);
            }

            if (els.entrance.length > 0) {
                let cnt_e = document.createElement("emc-collapsepanel");
                cnt_e.caption = 'entrances';
                for (let loc of els.entrance) {
                    cnt_e.append(loc);
                }
                cnt.append(cnt_e);
            }

            cnts.push(cnt);
        }
    }
    return cnts;
}

function createLogicMixinCategory(data, loadLogic) {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = Language.translate("mixin");
    for (let ref in data) {
        let el = document.createElement("div");
        el.dataset.ref = ref;
        el.dataset.cat = "mixin";
        el.className = "logic-location";
        el.onclick = loadLogic;
        el.innerHTML = ref;
        el.dataset.filtervalue = el.innerHTML;
        cnt.append(el);
    }
    return cnt;
}