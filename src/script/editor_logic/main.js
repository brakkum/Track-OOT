import Dialog from "/emcJS/ui/Dialog.js";
import LogicAbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import "/emcJS/ui/logic/EditorClipboard.js";
import "/emcJS/ui/logic/EditorTrashcan.js";
import "/emcJS/ui/logic/EditorWorkingarea.js";
import "/emcJS/ui/CaptionPanel.js";
import "/emcJS/ui/CollapsePanel.js";
import "/emcJS/ui/FilteredList.js";

import "/emcJS/ui/logic/elements/LiteralFalse.js";
import "/emcJS/ui/logic/elements/LiteralTrue.js";
import "/emcJS/ui/logic/elements/LiteralNumber.js";
import "/emcJS/ui/logic/elements/LiteralValue.js";
import "/emcJS/ui/logic/elements/OperatorAnd.js";
import "/emcJS/ui/logic/elements/OperatorNand.js";
import "/emcJS/ui/logic/elements/OperatorOr.js";
import "/emcJS/ui/logic/elements/OperatorNor.js";
import "/emcJS/ui/logic/elements/OperatorXor.js";
import "/emcJS/ui/logic/elements/OperatorNot.js";
import "/emcJS/ui/logic/elements/OperatorMin.js";
import "/emcJS/ui/logic/elements/OperatorMax.js";
import "./LiteralMixin.js";
import "./LiteralCustom.js";
import ListUtil from "./ListUtil.js";

import TrackerStorage from "/script/storage/TrackerStorage.js";
import GlobalData from "/emcJS/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";

import "./Navigation.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

(async function main() {
        
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
        let key = workingarea.dataset.logicKey;
        await LogicsStorage.set(key, workingarea.getLogic());
        return refreshLogic(event);
    }

    async function removeLogic(event) {
        let key = workingarea.dataset.logicKey;
        await LogicsStorage.delete(key);
        return refreshLogic(event);
    }

    async function getLogic(ref) {
        let logic = await LogicsStorage.get(ref, null);
        if (!!logic) {
            return logic;
        }
        return GlobalData.get(`logic/${ref}`);
    }

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    ListUtil.fillLists(loadLogic);

    //TODO
    //logicContainer.querySelector('.logic-location').click();
}());
