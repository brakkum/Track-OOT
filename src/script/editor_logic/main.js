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
//import "/script/ui/logic/LogicItem.js";
//import "/script/ui/logic/LogicMixin.js";
//import "/script/ui/logic/LogicOption.js";
//import "/script/ui/logic/LogicSkip.js";
//import "/script/ui/logic/LogicFilter.js";
//import "/script/ui/logic/LogicChest.js";
//import "/script/ui/logic/LogicSkulltula.js";

import SettingsStorage from "/script/storage/SettingsStorage.js";
import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";

import EditorLogic from "./Logic.js";
import "./Navigation.js";

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
    
    let locations = GlobalData.get("locations");
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

    fillLogics(locations, logic);
    fillOperators(document.getElementById("elements"), items, settings, filter, logic);

    function fillOperators(container, items, settings, filter, logic, onclick) {
        container.append(createDefaultOperatorCategory(onclick));

        container.append(createOperatorCategory(items, "tracker-logic-item", "items", onclick));
        container.append(createOperatorCategory(settings.options, "tracker-logic-option", "options", onclick));
        container.append(createOperatorCategory(settings.skips, "tracker-logic-skip", "skips", onclick));
        container.append(createOperatorCategory(filter, "tracker-logic-filter", "filter", onclick));
        // TODO create location operator factory
        // container.append(createOperatorCategory(chests, "tracker-logic-chest", "chests", onclick));
        // container.append(createOperatorCategory(skulltulas, "tracker-logic-skulltula", "skulltulas", onclick));
        container.append(createOperatorCategory(logic.mixins, "tracker-logic-mixin", "mixins", onclick));
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

    function createOperatorCategory(data, type, ref, onclick) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = ref;
        for (let i in data) {
            if (typeof data[i].logic_editor_visible != "boolean" || data[i].logic_editor_visible) {
                let el = document.createElement(type);
                el.ref = i;
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

    function fillLogics(locations, logic) {

        logicContainer.append(createLogicCategory(locations, "chests_v"));
        logicContainer.append(createLogicCategory(locations, "chests_mq"));
        logicContainer.append(createLogicCategory(locations, "skulltulas_v"));
        logicContainer.append(createLogicCategory(locations, "skulltulas_mq"));

        let cnt = document.createElement("deep-collapsepanel");
        cnt.caption = "mixins";
        for (let j in logic.mixins) {
            let el = document.createElement("div");
            el.dataset.ref = j;
            el.className = "logic-location";
            el.onclick = loadMixinLogic;
            el.innerHTML = I18n.translate(j);
            el.title = j;
            cnt.append(el);
        }
        logicContainer.append(cnt);
    }

    function createLogicCategory(data, ref) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = ref;
        for (let i in data) {
            let loc = data[i][ref];
            if (!loc) continue;
            let cnt = document.createElement("deep-collapsepanel");
            cnt.caption = i;
            for (let j in loc) {
                let el = document.createElement("div");
                el.dataset.ref = j;
                el.className = "logic-location";
                el.onclick = ref.startsWith("chest") ? loadChestLogic : loadSkulltulaLogic;
                el.innerHTML = I18n.translate(j);
                el.title = j;
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
        
    async function loadChestLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "chests";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(await EditorLogic.get("chests", ref));
        workingarea.caption = `[C] ${I18n.translate(ref)}`;
    }
        
    async function loadSkulltulaLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "skulltulas";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(await EditorLogic.get("skulltulas", ref));
        workingarea.caption = `[S] ${I18n.translate(ref)}`;
    }
        
    async function loadMixinLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "mixins";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(await EditorLogic.get("mixins", ref));
        workingarea.caption = `[M] ${I18n.translate(ref)}`;
    }

    async function refreshLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        workingarea.loadLogic(await EditorLogic.get(type, key));
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

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    //TODO
    //logicContainer.querySelector('.logic-location').click();
}());
