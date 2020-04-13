import Dialog from "/emcJS/ui/Dialog.js";
import LogicAbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import "/emcJS/ui/logic/EditorClipboard.js";
import "/emcJS/ui/logic/EditorTrashcan.js";
import "/emcJS/ui/logic/EditorWorkingarea.js";
import "/emcJS/ui/CaptionPanel.js";
import "/emcJS/ui/CollapsePanel.js";
import "/emcJS/ui/FilteredList.js";

import ListUtil from "./ListUtil.js";

import TrackerStorage from "/script/storage/TrackerStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";

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
        return FileData.get(`logic/${ref}`);
    }

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    ListUtil.fillLists(loadLogic);

}());
