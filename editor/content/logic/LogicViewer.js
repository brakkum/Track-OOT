import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Helper from "/emcJS/util/Helper.js";
import LogicUIAbstractElement from "/editors/ui/logic/AbstractElement.js";

const LogicsStorage = new IDBStorage('logics');

async function getLogic(ref, custom = false) {
    if (!!custom) {
        let logic = await LogicsStorage.get(ref, null);
        if (logic != null) {
            return logic;
        }
    }
    return FileData.get(`logic/${ref}`);
}

class LogicViewer {

    customLogic = false;

    async show(ref, title = ref) {
        let d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        let el = document.createElement("div");
        let logic = await getLogic(ref, !!this.customLogic);
        if (!!logic) {
            let l = LogicUIAbstractElement.buildLogic(logic);
            l.readonly = true;
            el.append(l);
        }
        d.append(el);
        d.show();
    }

    async printSVG(ref) {
        let logic = await getLogic(ref, !!this.customLogic);
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