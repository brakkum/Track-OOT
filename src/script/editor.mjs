import GlobalData from "/deepJS/storage/GlobalData.mjs";
import FileSystem from "/deepJS/util/FileSystem.mjs";
import "/deepJS/ui/logic/LogicEditorClipboard.mjs";
import "/deepJS/ui/logic/LogicEditorElements.mjs";
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

(async function main() {
    
    let locations = GlobalData.get("locations");

    let items = GlobalData.get("items");
    let options = GlobalData.get("options");
    let skips = GlobalData.get("skips");
    let filter = GlobalData.get("filter");

    let logic = GlobalData.get("logic");

    fillLogics(locations, logic);
    fillOperators(items, options, skips, filter, logic);

    let workingarea = document.getElementById('workingarea');

    function fillOperators(items, options, skips, filter, logic) {
        let container = document.getElementById("elements");

        for (let j in items) {
            let el = document.createElement("deep-logic-item");
            el.ref = j;
            el.template = "true";
            container.appendChild(el);
        }

        for (let j in logic.mixins) {
            let el = document.createElement("deep-logic-mixin");
            el.ref = j;
            el.template = "true";
            container.appendChild(el);
        }
    }

    function fillLogics(locations, logic) {
        let container = document.getElementById("logics");

        container.appendChild(createCategory(locations, "chests_v"));
        container.appendChild(createCategory(locations, "chests_mq"));
        container.appendChild(createCategory(locations, "skulltulas_v"));
        container.appendChild(createCategory(locations, "skulltulas_mq"));

        let cnt = document.createElement("deep-collapsepanel");
        cnt.caption = "mixins";
        for (let j in logic.mixins) {
            let el = document.createElement("div");
            el.dataset.ref = j;
            el.className = "logic-location";
            el.onclick = loadMixinLogic;
            el.innerHTML = j;
            el.title = j;
            cnt.appendChild(el);
        }
        container.appendChild(cnt);
    }

    function createCategory(data, ref) {
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
                el.innerHTML = j;
                el.title = j;
                cnt.appendChild(el);
            }
            ocnt.appendChild(cnt);
        }
        return ocnt;
    }
        
    function loadChestLogic(event) {
        let l = GlobalData.get("logic").chests[event.target.dataset.ref];
        workingarea.loadLogic(l);
    }
        
    function loadSkulltulaLogic(event) {
        let l = GlobalData.get("logic").skulltulas[event.target.dataset.ref];
        workingarea.loadLogic(l);
    }
        
    function loadMixinLogic(event) {
        let l = GlobalData.get("logic").mixins[event.target.dataset.ref];
        workingarea.loadLogic(l);
    }

    document.getElementById("editor-menu-file-exit").addEventListener("click", function(event) {
        document.getElementById('view-pager').active = "main";
    });
}());

async function downloadPatchedLogic() {
    let logic = JSON.parse(JSON.stringify(GlobalData.get("logic")));
    let logic_patched = GlobalData.get("logic_patched");
    for (let i in logic_patched) {
        logic[i] = logic[i] || {};
        for (let j in logic_patched[i]) {
            logic[i][j] = logic_patched[i][j];
        }
    }
    FileSystem.save(JSON.stringify(logic, " ", 4), "logic.json");
}