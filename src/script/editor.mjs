import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import "/deepJS/ui/logic/LogicEditorClipboard.mjs";
import "/deepJS/ui/logic/LogicEditorTrashcan.mjs";
import "/deepJS/ui/logic/LogicEditorWorkingarea.mjs";
import "/deepJS/ui/Panel.mjs";
import "/deepJS/ui/CollapsePanel.mjs";

import "/deepJS/ui/logic/elements/literals/LogicFalse.mjs";
import "/deepJS/ui/logic/elements/literals/LogicTrue.mjs";
import "/deepJS/ui/logic/elements/operators/LogicAnd.mjs";
import "/deepJS/ui/logic/elements/operators/LogicOr.mjs";
import "/deepJS/ui/logic/elements/operators/LogicNot.mjs";
import "/deepJS/ui/logic/elements/restrictors/LogicMin.mjs";
import "/script/ui/logic/LogicItem.mjs";
import "/script/ui/logic/LogicMixin.mjs";
import "/script/ui/logic/LogicOption.mjs";
import "/script/ui/logic/LogicSkip.mjs";
import "/script/ui/logic/LogicFilter.mjs";

import EditorLogic from "/script/editor/Logic.mjs";
import "/script/editor/Navigation.mjs";
import I18n from "/script/util/I18n.mjs";

const LOGIC_OPERATORS = [
    "deep-logic-false",
    "deep-logic-true",
    "deep-logic-not",
    "deep-logic-and",
    "deep-logic-or",
    "deep-logic-min"
];

(async function main() {
    
    let locations = GlobalData.get("locations");
    let logicContainer = document.getElementById("logics");

    let items = GlobalData.get("items");
    let settings = GlobalData.get("settings");
    let filter = GlobalData.get("filter");

    let mixins = {};

    let logic = GlobalData.get("logic");
    let custom_logic = GlobalData.get("logic_patched");

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
                    let el = DeepLogicAbstractElement.buildLogic(JSON.parse(res));
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
        
    function loadChestLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "chests";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(EditorLogic.get("chests", ref));
        workingarea.caption = `[C] ${I18n.translate(ref)}`;
    }
        
    function loadSkulltulaLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "skulltulas";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(EditorLogic.get("skulltulas", ref));
        workingarea.caption = `[S] ${I18n.translate(ref)}`;
    }
        
    function loadMixinLogic(event) {
        let ref = event.target.dataset.ref;
        workingarea.dataset.logicType = "mixins";
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(EditorLogic.get("mixins", ref));
        workingarea.caption = `[M] ${I18n.translate(ref)}`;
    }

    function refreshLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        workingarea.loadLogic(EditorLogic.get(type, key));
        event.preventDefault();
        return false;
    }

    function storeLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        EditorLogic.set(type, key, workingarea.getLogic());
        return refreshLogic(event);
    }

    function removeLogic(event) {
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        EditorLogic.remove(type, key);
        return refreshLogic(event);
    }

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    logicContainer.querySelector('.logic-location').click();
}());
