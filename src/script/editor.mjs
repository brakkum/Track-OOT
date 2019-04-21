import GlobalData from "/deepJS/storage/GlobalData.mjs";
import "/deepJS/ui/logic/LogicEditorClipboard.mjs";
import "/deepJS/ui/logic/LogicEditorTrashcan.mjs";
import "/deepJS/ui/logic/LogicEditorWorkingarea.mjs";
import "/deepJS/ui/Panel.mjs";
import "/deepJS/ui/CollapsePanel.mjs";

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

    fillLogics(locations, logic);
    fillOperators(items, settings, filter, logic);

    let workingarea = document.getElementById('workingarea');

    function fillOperators(items, settings, filter, logic) {
        let container = document.getElementById("elements");

        container.appendChild(createOperatorCategory(items, "tracker-logic-item", "items"));
        container.appendChild(createOperatorCategory(settings.options, "tracker-logic-option", "options"));
        container.appendChild(createOperatorCategory(settings.skips, "tracker-logic-skip", "skips"));
        container.appendChild(createOperatorCategory(filter, "tracker-logic-filter", "filter"));
        container.appendChild(createOperatorCategory(logic.mixins, "tracker-logic-mixin", "mixins"));
        
    }

    function createOperatorCategory(data, type, ref) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = ref;
        for (let i in data) {
            if (typeof data[i].logic_editor_visible != "boolean" || data[i].logic_editor_visible) {
                let el = document.createElement(type);
                el.ref = i;
                el.template = "true";
                ocnt.appendChild(el);
            }
        }
        return ocnt;
    }

    function fillLogics(locations, logic) {

        logicContainer.appendChild(createLogicCategory(locations, "chests_v"));
        logicContainer.appendChild(createLogicCategory(locations, "chests_mq"));
        logicContainer.appendChild(createLogicCategory(locations, "skulltulas_v"));
        logicContainer.appendChild(createLogicCategory(locations, "skulltulas_mq"));

        let cnt = document.createElement("deep-collapsepanel");
        cnt.caption = "mixins";
        for (let j in logic.mixins) {
            let el = document.createElement("div");
            el.dataset.ref = j;
            el.className = "logic-location";
            el.onclick = loadMixinLogic;
            el.innerHTML = I18n.translate(j);
            el.title = j;
            cnt.appendChild(el);
        }
        logicContainer.appendChild(cnt);
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
                cnt.appendChild(el);
            }
            ocnt.appendChild(cnt);
        }
        return ocnt;
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

    // TODO implement save and clear
    workingarea.addEventListener('save', refreshLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', refreshLogic);
    window.addEventListener('focus', refreshLogic);

    logicContainer.querySelector('.logic-location').click();
}());