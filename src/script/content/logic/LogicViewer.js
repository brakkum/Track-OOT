import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Helper from "/emcJS/util/Helper.js";
import Logic from "/script/util/Logic.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import LogicUIAbstractElement from "/editors/logic/elements/AbstractElement.js";

const SettingsStorage = new IDBStorage('settings');
const LogicsStorage = new IDBStorage('logics');

async function getLogic(ref) {
    let logic = FileData.get(`logic/${ref}`, {});
    if (await SettingsStorage.get('use_custom_logic', false)) {
        logic = await LogicsStorage.get(ref, logic);
    }
    return logic;
}

class LogicViewer {

    async show(ref, title = ref) {
        let d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        let el = document.createElement("div");
        let logic = await getLogic(ref);
        let filter_data = FilterStorage.getAll();
        let state_data  = StateStorage.getAll();
        let logic_data  = Logic.getAll();
        if (!!logic) {
            let l = LogicUIAbstractElement.buildLogic(logic);
            l.calculate(Object.assign(filter_data, state_data, logic_data));
            l.readonly = true;
            el.append(l);
        }
        d.append(el);
        d.show();
    }

    async printSVG(ref) {
        let logic = await getLogic(ref);
        if (!!logic) {
            let svg = LogicUIAbstractElement.buildSVG(logic);
            let png = await Helper.svg2png(svg);
            let svg_win = window.open("", "_blank", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no");
            let img = document.createElement("img");
            img.src = png;
            svg_win.document.body.append(img);
        } else {
            //TODO show error
        }
    }
}

export default new LogicViewer();