import FileData from "/emcjs/storage/FileData.js";
import IDBStorage from "/emcjs/storage/IDBStorage.js";
import Dialog from "/emcjs/ui/Dialog.js";
import Helper from "/emcjs/util/Helper.js";
import LogicUIAbstractElement from "/editors/logic/elements/AbstractElement.js";

const LogicsStorage = new IDBStorage('logics');

async function getLogic(ref) {
    let logic = await LogicsStorage.get(ref, null);
    if (!!logic) {
        return logic;
    }
    return FileData.get(`logic/${ref}`);
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
        if (!!logic) {
            let l = LogicUIAbstractElement.buildLogic(logic);
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