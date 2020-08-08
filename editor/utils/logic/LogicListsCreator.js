
import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";

import ReferrerAt from "/editors/logic/elements/ReferrerAt.js";

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
    "ted-logic-xnor",
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
        let functions = {};
        
        if (!!logic) {
            for (let i in logic.logic) {
                if (i.startsWith("mixin.")) {
                    mixins[i] = logic[i];
                    continue;
                }
                if (i.startsWith("function.")) {
                    functions[i] = logic[i];
                    continue;
                }
            }
        }
        if (!!custom_logic) {
            for (let i in custom_logic.logic) {
                if (i.startsWith("mixin.")) {
                    mixins[i] = logic[i];
                    continue;
                }
                if (i.startsWith("function.")) {
                    functions[i] = logic[i];
                    continue;
                }
            }
        }

        // OPERATORS
        result.operators.push(createDefaultOperatorCategory());
        result.operators.push(createItemOperatorCategory(items));
        result.operators.push(createSettingsOperatorCategory(randomizer_options.options, "option"));
        result.operators.push(createSettingsOperatorCategory(randomizer_options.skips, "skip"));
        result.operators.push(createFilterOperatorCategory(filter));
        /*for (let cat of createOperatorWorldCategories(world)) {
            result.operators.push(cat);
        }*/
        result.operators.push(createOperatorLocationDoneCategory(world));
        
        for (let cat of createOperatorReachCategories(logic.edges)) {
            result.operators.push(cat);
        }

        result.operators.push(createOperatorMixins(mixins));
        result.operators.push(createOperatorFunctions(functions));
        
        // LOGICS
        //for (let cat of createLogicWorldCategories(world_lists, world)) {
        //    result.logics.push(cat);
        //}
        result.logics.push(createLogicGraphCategory(logic.edges, world));
        result.logics.push(createLogicMixinCategory(mixins));
        result.logics.push(createLogicFunctionCategory(functions));

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

function createItemOperatorCategory(data) {
    let res = {
        "type": "group",
        "caption": "item",
        "children": []
    };
    for (let i in data) {
        res.children.push({
            "type": "tracker-logic-custom",
            "ref": i,
            "category": "item"
        });
    }
    return res;
}

function createFilterOperatorCategory(data, ref) {
    let res = {
        "type": "group",
        "caption": "filter",
        "children": []
    };
    for (let i in data) {
        let opt = data[i];
        for (let j of opt.values) {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": i,
                "value": j,
                "category": "filter"
            });
        }
    }
    return res;
}

function createSettingsOperatorCategory(data, ref) {
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

function createOperatorReachCategories(data) {
    let lbuf = {
        "type": "group",
        "caption": "locations reach",
        "children": []
    };
    let rbuf = {
        "type": "group",
        "caption": "regions reach",
        "children": []
    };
    let ebuf = {
        "type": "group",
        "caption": "events reach",
        "children": []
    };
    for (let ref in data) {
        let sub = data[ref];
        for (let sref in sub) {
            if (sref.startsWith("logic.location.")) {
                lbuf.children.push({
                    "type": "ted-logic-at",
                    "ref": sref,
                    "category": "location"
                });
            } else if (sref.startsWith("region.")) {
                rbuf.children.push({
                    "type": "ted-logic-at",
                    "ref": sref,
                    "category": "region"
                });
            } else if (sref.startsWith("event.")) {
				ebuf.children.push({
                    "type": "ted-logic-at",
					"ref": sref,
					"category": "event"
				});
			}
        }
    }
    return [lbuf, rbuf, ebuf];
}

function createOperatorLocationDoneCategory(world) {
    let res = {
        "type": "group",
        "caption": "locations done",
        "children": []
    };
    for (let name in world) {
        let ref = world[name];
        if (ref.category == "location") {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": name,
                "category": "location"
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

function createOperatorFunctions(data) {
    let res = {
        "type": "group",
        "caption": "function",
        "children": []
    };
    for (let ref in data) {
        res.children.push({
            "type": "tracker-logic-linked",
            "ref": ref,
            "category": "function"
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
                        "icon": `/images/icons/${ref.type}.svg`
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
                        "icon": `/images/icons/${ref.type}.svg`
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

function createLogicGraphCategory(data, world) {
    let res = {
        "type": "group",
        "caption": "graph",
        "children": []
    };
    for (let ref in data) {
        let lbuf = {
            "type": "group",
            "caption": "locations",
            "children": []
        };
        let rbuf = {
            "type": "group",
            "caption": "regions",
            "children": []
        };
		let ebuf = {
			"type": "group",
			"caption": "events",
			"children": []
		};
        let sub = data[ref];
        for (let sref in sub) {
            if (sref.startsWith("logic.location.")) {
                let name = sref.slice(6);
                let loc = world[name];
                if (!!loc) {
                    lbuf.children.push({
                        "type": loc.type,
                        "edge": [ref, sref],
                        "category": "location",
                        "content": sref,
                        "icon": `/images/icons/${loc.type}.svg`
                    });
                } else {
                    lbuf.children.push({
                        "edge": [ref, sref],
                        "category": "location",
                        "content": sref
                    });
                }
            } else if (sref.startsWith("region.")) {
                rbuf.children.push({
                    "edge": [ref, sref],
                    "category": "region",
                    "content": sref
                });
            } else if (sref.startsWith("event.")) {
				ebuf.children.push({
					"edge": [ref, sref],
					"category": "event",
					"content": sref
				});
			}
        }
        let ch = [];
        if (!!lbuf.children.length) {
            ch.push(lbuf);
        }
        if (!!rbuf.children.length) {
            ch.push(rbuf);
        }
        if (!!ebuf.children.length) {
            ch.push(ebuf);
        }
        res.children.push({
            "type": "group",
            "caption": ref,
            "children": ch
        });
    }
    return res;
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

function createLogicFunctionCategory(data) {
    let res = {
        "type": "group",
        "caption": "function",
        "children": []
    };
    for (let ref in data) {
        res.children.push({
            "access": ref,
            "category": "function",
            "content": ref
        });
    }
    return res;
}