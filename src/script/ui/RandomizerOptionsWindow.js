import SettingsWindow from "/emcJS/ui/SettingsWindow.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import "/emcJS/ui/Paging.js";

import GlobalData from "/emcJS/storage/GlobalData.js";
import StateStorage from "/script/storage/StateStorage.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import SettingsBuilder from "/script/util/SettingsBuilder.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

export default class RomSettings {

    constructor() {
        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            let settings = {};
            let options = GlobalData.get("randomizer_options");
            for (let i in event.data) {
                for (let j in event.data[i]) {
                    let v = event.data[i][j];
                    if (Array.isArray(v)) {
                        v = new Set(v);
                        options[i][j].values.forEach(el => {
                            settings[el] = v.has(el);
                        });
                    } else {
                        settings[j] = v;
                    }
                }
            }
            StateStorage.write(settings);
            EventBus.trigger("randomizer_options", settings);
            BusyIndicator.unbusy();
        });
        let options = GlobalData.get("randomizer_options");
        SettingsBuilder.build(settings, options);
    }

    show() {
        let options = GlobalData.get("randomizer_options");
        let res = {};
        for (let i in options) {
            res[i] = res[i] || {};
            for (let j in options[i]) {
                let opt = options[i][j];
                if (opt.type === "list") {
                    let def = new Set(opt.default);
                    let val = [];
                    for (let el of opt.values) {
                        if (StateStorage.read(el, def.has(el))) {
                            val.push(el);
                        }
                    }
                    res[i][j] = val;
                } else {
                    res[i][j] = StateStorage.read(j, opt.default);
                }
            }
        }
        settings.show(res/*, Object.keys(options)[0]*/);
    }

}