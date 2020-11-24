import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import LogicUIAbstractElement from "/editors/ui/logic/AbstractElement.js";

function extractLogic(data, customData, ref) {
    const res = [];
    for (const name in data.logic) {
        if (name == ref || name == `${ref}[child]` || name == `${ref}[adult]`) {
            if (customData.hasOwnProperty(name)) {
                res.push(customData[name]);
            } else {
                res.push(data.logic[name]);
            }
        }
    }
    for (const region in data.edges) {
        for (const name in data.edges[region]) {
            if (name == ref || name == `${ref}[child]` || name == `${ref}[adult]`) {
                const key = `${region} -> ${name}`;
                if (customData.hasOwnProperty(key)) {
                    res.push(customData[key]);
                } else {
                    res.push(data.edges[region][name]);
                }
            }
        }
    }
    return res;
}

async function getNormalLogic(ref, custom) {
    const data = FileData.get('logic', {});
    if (!!custom) {
        const LogicsStorage = new IDBStorage('logics');
        const customData = await LogicsStorage.getAll();
        return extractLogic(data, customData, ref);
    } else {
        return extractLogic(data, {}, ref);
    }
}

async function getGlitchedLogic(ref, custom) {
    const data = FileData.get('logic_glitched', {});
    if (!!custom) {
        const LogicsStorage = new IDBStorage('logics_glitched');
        const customData = await LogicsStorage.getAll();
        return extractLogic(data, customData, ref);
    } else {
        return extractLogic(data, {}, ref);
    }
}

async function getLogic(ref, glitched, custom) {
    if (glitched) {
        return getGlitchedLogic(ref, custom);
    }
    return getNormalLogic(ref, custom);
}

class LogicViewer {

    customLogic = false;
    glitched = false;

    async show(ref, title = ref) {
        const d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        const el = document.createElement("div");
        el.style.display = "flex";
        const result = await getLogic(ref, !!this.glitched, !!this.customLogic);
        for (const logic of result) {
            if (!!logic) {
                const l = LogicUIAbstractElement.buildLogic(logic);
                l.readonly = true;
                el.append(l);
            }
        }
        d.append(el);
        d.show();
    }

}

export default new LogicViewer();