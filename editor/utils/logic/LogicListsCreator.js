
import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";

const LogicsStorage = new IDBStorage('logics');

const LOGIC_OPERATORS = [
    "ted-logic-false",
    "ted-logic-true",
    "ted-logic-not",
    "ted-logic-and",
    "ted-logic-nand",
    "ted-logic-or",
    "ted-logic-nor",
    "ted-logic-xor",
    "ted-logic-min",
    "ted-logic-max"
];
const CUSTOM_OPERATOR_GROUP = [
    "location"
];

class LogicListsCreator {

    async createLists() {

        let result = {
            logics: [],
            operators: []
        };

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

        // OPERATORS
        result.operators.push(createDefaultOperatorCategory());
        result.operators.push(createOperatorCategory(items, "item"));
        result.operators.push(createOperatorCategory(randomizer_options.options, "option"));
        result.operators.push(createOperatorCategory(randomizer_options.skips, "skip"));
        result.operators.push(createOperatorCategory(filter, "filter"));
        for (let cat of createOperatorWorldCategories(world)) {
            result.operators.push(cat);
        }
        result.operators.push(createOperatorMixins(mixins));
        
        // LOGICS
        for (let cat of createLogicWorldCategories(world_lists, world)) {
            result.logics.push(cat);
        }
        result.logics.push(createLogicMixinCategory(mixins));

        return result;
    }

}

export default new LogicListsCreator();

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    let res = {
        "type": "group",
        "caption": "default",
        "children": []
    };
    for (let i in LOGIC_OPERATORS) {
        res.children.push({
            "type": LOGIC_OPERATORS[i]
        });
    }
    return res;
}

function createOperatorCategory(data, ref) {
    let res = {
        "type": "group",
        "caption": ref,
        "children": []
    };
    for (let i in data) {
        let opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "list") {
            for (let j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": j,
                    "category": ref
                });
            }
        } else if (opt.type === "choice") {
            for (let j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "value": j,
                    "category": ref
                });
            }
        } else {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": i,
                "category": ref
            });
        }
    }
    return res;
}

function createOperatorWorldCategories(world) {
    let res = [];

    let els = {};

    for (let name in world) {
        let ref = world[name];
        if (els[ref.category] == null) {
            els[ref.category] = [];
        }
        if (CUSTOM_OPERATOR_GROUP.indexOf(ref.category) >= 0) {
            els[ref.category].push({
                "type": "tracker-logic-custom",
                "ref": name,
                "category": ref.category
            });
        } else {
            els[ref.category].push({
                "type": "tracker-logic-linked",
                "ref": ref.access,
                "category": ref.category
            });
        }
    }

    for (let cat in els) {
        if (els[cat].length > 0) {
            res.push({
                "type": "group",
                "caption": cat,
                "children": els[cat]
            });
        }
    }

    return res;
}

function createOperatorMixins(data) {
    let res = {
        "type": "group",
        "caption": "mixin",
        "children": []
    };
    for (let ref in data) {
        res.children.push({
            "type": "tracker-logic-linked",
            "ref": ref,
            "category": "mixin"
        });
    }
    return res;
}

// LOGICS
// -------------------
function createLogicWorldCategories(data, world) {
    let ress = [];

    for (let name in data) {
        if (name == "#") continue; 
        let lists = data[name].lists;
        if (name == "") name = "area.overworld";
        if (lists.hasOwnProperty("v")) {
            let res = {
                "type": "group",
                "caption": name,
                "children": []
            };

            let els = {};

            for (let record of lists.v) {
                let ref = world[record.id];
                if (!!ref) {
                    if (els[ref.category] == null) {
                        els[ref.category] = [];
                    }
                    els[ref.category].push({
                        "type": ref.type,
                        "access": ref.access,
                        "category": ref.category,
                        "content": record.id,
                        "icon": `/src/images/icons/${ref.type}.svg`
                    });
                } else {
                    Dialog.alert("Error!", `creating world logics encountered missing id in world.json file: ${record.id}`);
                }
            }

            for (let cat in els) {
                if (els[cat].length > 0) {
                    res.children.push({
                        "type": "group",
                        "caption": cat,
                        "children": els[cat]
                    });
                }
            }

            ress.push(res);
        }
        if (lists.hasOwnProperty("mq")) {
            let res = {
                "type": "group",
                "caption": `${name} MQ`,
                "children": []
            };

            let els = {};

            for (let record of lists.mq) {
                let ref = world[record.id];
                if (!!ref) {
                    if (els[ref.category] == null) {
                        els[ref.category] = [];
                    }
                    els[ref.category].push({
                        "type": ref.type,
                        "access": ref.access,
                        "category": ref.category,
                        "content": record.id,
                        "icon": `/src/images/icons/${ref.type}.svg`
                    });
                } else {
                    Dialog.alert("Error!", `creating world logics encountered missing id in world.json file: ${record.id}`);
                }
            }

            for (let cat in els) {
                if (els[cat].length > 0) {
                    res.children.push({
                        "type": "group",
                        "caption": cat,
                        "children": els[cat]
                    });
                }
            }

            ress.push(res);
        }
    }
    return ress;
}

function createLogicMixinCategory(data) {
    let res = {
        "type": "group",
        "caption": "mixin",
        "children": []
    };
    for (let ref in data) {
        res.children.push({
            "access": ref,
            "category": "mixin",
            "content": ref
        });
    }
    return res;
}