
import GlobalData from "/emcJS/storage/GlobalData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import I18n from "/script/util/I18n.js";

const LogicsStorage = new TrackerStorage('logics');

const L_CATEGORIES = ["location", "area", "entrance", "mixin"];

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

        let world = GlobalData.get("world");
        let world_lists = GlobalData.get("world_lists");
        let items = GlobalData.get("items");
        let settings = GlobalData.get("settings");
        let filter = GlobalData.get("filter");
        let logic = GlobalData.get("logic");
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
        operatorContainer.append(createOperatorCategory(settings.options, "option"));
        operatorContainer.append(createOperatorCategory(settings.skips, "skip"));
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
function createGenericOperator(name, data, category) {
    if (data.type === "list") {
        for (let j of data.values) {
            let el = document.createElement("tracker-logic-custom");
            el.ref = j;
            el.category = category;
            el.template = "true";
            return el;
        }
    } else if (data.type === "choice") {
        for (let j of data.values) {
            let el = document.createElement("tracker-logic-custom");
            el.ref = name;
            el.value = j;
            el.category = category;
            el.template = "true";
            return el;
        }
    } else {
        let el = document.createElement("tracker-logic-custom");
        el.ref = name;
        el.category = category;
        el.template = "true";
        return el;
    }
}

function createDefaultOperatorCategory() {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = I18n.translate("default");
    for (let i in LOGIC_OPERATORS) {
        let el = document.createElement(LOGIC_OPERATORS[i]);
        el.template = "true";
        cnt.append(el);
    }
    return cnt;
}

function createOperatorCategory(data, ref) {
    let cnt = document.createElement("emc-collapsepanel");
    cnt.caption = I18n.translate(`${ref}`);
    for (let i in data) {
        let opt = data[i];
        cnt.append(createGenericOperator(i, opt, ref));
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
        el.ref = ref.access;
        el.category = ref.category;
        el.template = "true";
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
    cnt.caption = I18n.translate("mixin");
    for (let ref in data) {
        let el = document.createElement("tracker-logic-mixin");
        el.ref = ref;
        el.category = "mixin";
        el.template = "true";
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
        let caption = I18n.translate(name);
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
                el.innerHTML = I18n.translate(record.id);
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
                el.innerHTML = I18n.translate(record.id);
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
    cnt.caption = I18n.translate("mixin");
    for (let ref in data) {
        let el = document.createElement("div");
        el.dataset.ref = ref;
        el.dataset.cat = "mixin";
        el.className = "logic-location";
        el.onclick = loadLogic;
        el.innerHTML = ref;
        cnt.append(el);
    }
    return cnt;
}