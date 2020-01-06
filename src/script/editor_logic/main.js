import Dialog from "/deepJS/ui/Dialog.js";
import LogicAbstractElement from "/deepJS/ui/logic/elements/AbstractElement.js";
import "/deepJS/ui/logic/EditorClipboard.js";
import "/deepJS/ui/logic/EditorTrashcan.js";
import "/deepJS/ui/logic/EditorWorkingarea.js";
import "/deepJS/ui/CaptionPanel.js";
import "/deepJS/ui/CollapsePanel.js";

import "/deepJS/ui/logic/elements/LiteralFalse.js";
import "/deepJS/ui/logic/elements/LiteralTrue.js";
import "/deepJS/ui/logic/elements/LiteralNumber.js";
import "/deepJS/ui/logic/elements/LiteralValue.js";
import "/deepJS/ui/logic/elements/OperatorAnd.js";
import "/deepJS/ui/logic/elements/OperatorNand.js";
import "/deepJS/ui/logic/elements/OperatorOr.js";
import "/deepJS/ui/logic/elements/OperatorNor.js";
import "/deepJS/ui/logic/elements/OperatorXor.js";
import "/deepJS/ui/logic/elements/OperatorNot.js";
import "/deepJS/ui/logic/elements/OperatorMin.js";
import "/deepJS/ui/logic/elements/OperatorMax.js";
import "./LiteralMixin.js";
import "./LiteralCustom.js";

import TrackerStorage from "/script/storage/TrackerStorage.js";
import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";

import EditorLogic from "./Logic.js";
import "./Navigation.js";

const SettingsStorage = new TrackerStorage('settings');

const LOGIC_OPERATORS = [
    "deep-logic-false",
    "deep-logic-true",
    "deep-logic-not",
    "deep-logic-and",
    "deep-logic-nand",
    "deep-logic-or",
    "deep-logic-nor",
    "deep-logic-xor",
    "deep-logic-min",
    "deep-logic-max"
];

(async function main() {

    let world = GlobalData.get("world");
    let logicContainer = document.getElementById("logics");

    let items = GlobalData.get("items");
    let settings = GlobalData.get("settings");
    let filter = GlobalData.get("filter");

    let mixins = {};

    let logic = GlobalData.get("logic");
    let custom_logic = await SettingsStorage.get("logic", {});

    if (!!logic.mixins) {
        for (let i in logic.mixins) {
            mixins[i] = logic.mixins[i];
        }
    }
    if (!!custom_logic.mixins) {
        for (let i in custom_logic.mixins) {
            mixins[i] = custom_logic.mixins[i];
        }
    }

    let workingarea = document.getElementById('workingarea');

    workingarea.addEventListener("placeholderclicked", function(event) {
        createAddLogicDialog();
    });

    fillLogics(world, logic);
    fillOperators(document.getElementById("elements"), items, settings, filter, world, logic);

    function fillOperators(container, items, settings, filter, world, logic, onclick) {
        container.append(createDefaultOperatorCategory(onclick));

        container.append(createOperatorCategory(items, "item", onclick));
        container.append(createOperatorCategory(settings.options, "option", onclick));
        container.append(createOperatorCategory(settings.skips, "skip", onclick));
        container.append(createOperatorCategory(filter, "filter", onclick));
        container.append(createOperatorCategory(world.locations, "location", onclick));
        // container.append(createOperatorCategory(skulltulas, "tracker-logic-skulltula", "skulltulas", onclick));
        container.append(createOperatorMixins(logic, onclick));
    }

    function createDefaultOperatorCategory(onclick) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = "default";
        for (let i in LOGIC_OPERATORS) {
            let el = document.createElement(LOGIC_OPERATORS[i]);
            el.template = "true";
            if (typeof onclick == "function") {
                el.onclick = onclick;
                el.readonly = "true";
            }
            ocnt.append(el);
        }
        return ocnt;
    }

    function createOperatorMixins(data, onclick) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = "mixin";
        for (let ref in data) {
            if (!ref.startsWith("mixin.")) continue;
            let el = document.createElement("tracker-logic-mixin");
            el.ref = ref;
            el.category = "mixin";
            el.template = "true";
            if (typeof onclick == "function") {
                el.onclick = onclick;
                el.readonly = "true";
            }
            ocnt.append(el);
        }
        return ocnt;
    }

    function createOperatorCategory(data, ref, onclick) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = ref;
        for (let i in data) {
            let opt = data[i];
            if (opt.type === "list") {
                for (let j of opt.values) {
                    let el = document.createElement("tracker-logic-custom");
                    el.ref = j;
                    el.category = ref;
                    el.template = "true";
                    if (typeof onclick == "function") {
                        el.onclick = onclick;
                        el.readonly = "true";
                    }
                    ocnt.append(el);
                }
            } else if (opt.type === "choice") {
                for (let j of opt.values) {
                    let el = document.createElement("tracker-logic-custom");
                    el.ref = i;
                    el.value = j;
                    el.category = ref;
                    el.template = "true";
                    if (typeof onclick == "function") {
                        el.onclick = onclick;
                        el.readonly = "true";
                    }
                    ocnt.append(el);
                }
            } else {
                let el = document.createElement("tracker-logic-custom");
                el.ref = i;
                el.category = ref;
                el.template = "true";
                if (typeof onclick == "function") {
                    el.onclick = onclick;
                    el.readonly = "true";
                }
                ocnt.append(el);
            }
        }
        return ocnt;
    }

    function fillLogics(world, logic) {

        logicContainer.append(createLogicCategory(world, "locations"));
        logicContainer.append(createLogicCategory(world, "entrances"));

        let cnt = document.createElement("deep-collapsepanel");
        cnt.caption = "mixins";
        for (let ref in logic) {
            if (!ref.startsWith("mixin.")) continue;
            let el = document.createElement("div");
            el.dataset.ref = ref;
            el.dataset.cat = "mixin";
            el.className = "logic-location";
            el.onclick = loadLogic;
            el.innerHTML = ref;
            cnt.append(el);
        }
        logicContainer.append(cnt);
    }

    function createLogicCategory(data, ref) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = ref;
        for (let i in data.areas) {
            let loc = data.areas[i];
            if (!loc) continue;
            let cnt = document.createElement("deep-collapsepanel");
            cnt.caption = I18n.translate(i);
            for (let j of loc[ref]) {
                let el = document.createElement("div");
                el.dataset.ref = data[ref][j].access;
                el.dataset.cat = data[ref][j].type;
                el.className = "logic-location";
                el.onclick = loadLogic;
                el.innerHTML = I18n.translate(j);
                cnt.append(el);
            }
            ocnt.append(cnt);
        }
        return ocnt;
    }

    function createAddLogicDialog() {
        let dialogElement = document.createElement('div');
        let d = new Dialog({
            title: "Add element to logic",
            submit: "OK"
        });
        d.onsubmit = function(reciever, slot, result) {
            if (!!result) {
                let res = dialogElement.dataset.choice;
                if (!!res) {
                    let el = LogicAbstractElement.buildLogic(JSON.parse(res));
                    if (!!slot) {
                        el.slot = slot;
                    }
                    reciever.append(el);
                }
            }
        }.bind(this, event.reciever, event.name);
        let last = null;
        fillOperators(dialogElement, items, settings, filter, logic, function(event) {
            if (last != null) {
                last.style.boxShadow = "";
            }
            dialogElement.dataset.choice = JSON.stringify(event.target.toJSON());
            last = event.target;
            last.style.boxShadow = "0 0 0 5px black";
        });
        d.append(dialogElement);
        d.show();
    }
        
    async function loadLogic(event) {
        let ref = event.target.dataset.ref;
        let cat = event.target.dataset.cat;
        workingarea.dataset.logicType = cat;
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(await getLogic(ref));
        document.getElementById("workingarea-panel").caption = `${event.target.innerHTML} [${cat}]`;
    }

    async function refreshLogic(event) {
        let ref = workingarea.dataset.logicKey;
        workingarea.loadLogic(await getLogic(ref));
        event.preventDefault();
        return false;
    }

    async function storeLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        await EditorLogic.set(type, key, workingarea.getLogic());
        return refreshLogic(event);
    }

    async function removeLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        await EditorLogic.remove(type, key);
        return refreshLogic(event);
    }

    async function getLogic(ref) {
        if (await SettingsStorage.get("use_custom_logic", false)) {
            let logic = (await SettingsStorage.get("logic", {}))[ref];
            if (!!logic) {
                return logic;
            }
        }
        return GlobalData.get(`logic/${ref}`);
    }

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    //TODO
    //logicContainer.querySelector('.logic-location').click();
}());
