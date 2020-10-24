
import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";

const LogicsStorage = new IDBStorage('logics');
const LogicsStorageGlitched = new IDBStorage('logics_glitched');

const LOGIC_OPERATORS = [
    // literals
    "jse-logic-false",
    "jse-logic-true",
    // operators
    "jse-logic-not",
    "jse-logic-and",
    "jse-logic-nand",
    "jse-logic-or",
    "jse-logic-nor",
    "jse-logic-xor",
    "jse-logic-xnor",
    "jse-logic-min",
    "jse-logic-max",
    // comparators
    "jse-logic-eq",
    "jse-logic-gt",
    "jse-logic-gte",
    "jse-logic-lt",
    "jse-logic-lte",
    "jse-logic-neq"
];
const CUSTOM_OPERATOR_GROUP = [
    "location"
];

class LogicListsCreator {

    async createLists(glitched = false) {

        let result = {
            logics: [],
            operators: []
        };

        let world = FileData.get("world/marker");
        let items = FileData.get("items");
        let randomizer_options = FileData.get("randomizer_options");
        let filter = FileData.get("filter");
        let logic = FileData.get(`logic${!!glitched?"_glitched":""}`);
        let custom_logic = {};
        if (!!glitched) {
            custom_logic = await LogicsStorageGlitched.getAll();
        } else {
            custom_logic = await LogicsStorage.getAll();
        }

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
        if (opt.type === "choice") {
            for (let j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "value": j,
                    "category": ref
                });
            }
        } else {
            if (opt.type === "list") {
                for (let j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
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
                    "type": "tracker-logic-custom",
                    "ref": sref,
                    "category": "location"
                });
            } else if (sref.startsWith("region.")) {
                rbuf.children.push({
                    "type": "jse-logic-at",
                    "ref": sref,
                    "category": "region"
                });
            } else if (sref.startsWith("event.")) {
				ebuf.children.push({
                    "type": "tracker-logic-custom",
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
            "type": "tracker-logic-mixin",
            "ref": ref
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
            "type": "tracker-logic-function",
            "ref": ref
        });
    }
    return res;
}

// LOGICS
// -------------------
function createLogicGraphCategory(data, world) {
    let resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
    let resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
	let res = {
        "type": "group",
        "caption": "graph",
        "children": [resC, resA]
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
        if (ref.endsWith("[child]")) {
        for (let sref in sub) {
            if (sref.startsWith("logic.location.")) {
                let name = sref.slice(6);
                let loc = world[name];
                if (!!loc) {
                    lbuf.children.push({
                        "type": loc.type,
                        "ref": `${ref} -> ${sref}`,
                        "category": "location",
                        "content": sref,
                        "icon": `/images/icons/${loc.type}.svg`
                    });
                } else {
                    lbuf.children.push({
                        "ref": `${ref} -> ${sref}`,
                        "category": "location",
                        "content": sref
                    });
                }
            } else if (sref.startsWith("region.")) {
                rbuf.children.push({
                    "ref": `${ref} -> ${sref}`,
                    "category": "region",
                    "content": sref
                });
            } else if (sref.startsWith("event.")) {
				ebuf.children.push({
                    "ref": `${ref} -> ${sref}`,
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
        resC.children.push({
            "type": "group",
            "caption": ref,
            "children": ch
        });
		} else {
			lbuf = {
				"type": "group",
				"caption": "locations",
				"children": []
			};
			rbuf = {
				"type": "group",
				"caption": "regions",
				"children": []
			};
			ebuf = {
				"type": "group",
				"caption": "events",
				"children": []
			};
			for (let sref in sub) {
				if (sref.startsWith("logic.location.")) {
					let name = sref.slice(6);
					let loc = world[name];
					if (!!loc) {
						lbuf.children.push({
							"type": loc.type,
                            "ref": `${ref} -> ${sref}`,
							"category": "location",
							"content": sref,
							"icon": `/images/icons/${loc.type}.svg`
						});
					} else {
						lbuf.children.push({
                            "ref": `${ref} -> ${sref}`,
							"category": "location",
							"content": sref
						});
					}
				} else if (sref.startsWith("region.")) {
					rbuf.children.push({
                        "ref": `${ref} -> ${sref}`,
						"category": "region",
						"content": sref
					});
				} else if (sref.startsWith("event.")) {
					ebuf.children.push({
                        "ref": `${ref} -> ${sref}`,
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
			resA.children.push({
				"type": "group",
				"caption": ref,
				"children": ch
			});
		}
	}
    return res;
}

function createLogicMixinCategory(data) {
    let resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
	let resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
	let res = {
        "type": "group",
        "caption": "mixin",
        "children": [resC, resA]
    };
    for (let ref in data) {
		if(ref.endsWith("[child]")) {
			resC.children.push({
				"ref": ref,
				"category": "mixin",
				"content": ref
			});
		} else {
			resA.children.push({
				"ref": ref,
				"category": "mixin",
				"content": ref
			});
		}
    }
    return res;
}

function createLogicFunctionCategory(data) {
	let resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
	let resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
    let res = {
        "type": "group",
        "caption": "function",
        "children": [resC, resA]
    };
    for (let ref in data) {
		if(ref.endsWith("[child]")) {
			resC.children.push({
				"ref": ref,
				"category": "function",
				"content": ref
			});
		} else {
			resA.children.push({
				"ref": ref,
				"category": "function",
				"content": ref
			});
		}
    }
    return res;
}