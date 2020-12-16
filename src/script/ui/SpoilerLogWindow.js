
import Template from "/emcJS/util/Template.js";
import SettingsWindow from "/emcJS/ui/overlay/SettingsWindow.js";
import FileData from "/emcJS/storage/FileData.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import "/emcJS/ui/Paging.js";

import StateStorage from "/script/storage/StateStorage.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import SettingsBuilder from "/script/util/SettingsBuilder.js";
import Language from "/script/util/Language.js";
import SpoilerParser from "/script/util/SpoilerParser.js";

let spoiler = {};
const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const LOAD_SPOILER = new Template(`
    <div id="options-spoiler-wrapper">
        <button id="load-spoiler-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);

async function loadSpoiler(button) {
    spoiler = await FileSystem.load(".json");
    if (!!spoiler && !!spoiler.data) {
        button.innerHTML = Language.translate('loaded-spoiler-button');
    }
}

export default class SpoilerLogSettings {

    constructor() {
        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            const options = FileData.get("spoiler_options");
            const settingsData = {};
            for (const i in event.data) {
                for (const j in event.data[i]) {
                    let v = event.data[i][j];
                    if (Array.isArray(v)) {
                        v = new Set(v);
                        options[i][j].values.forEach(el => {
                            StateStorage.writeExtra("parseSpoiler", el, v.has(el));
                            settingsData[el] = v.has(el);
                        });
                    } else {
                        StateStorage.writeExtra("parseSpoiler", j, v);
                        settingsData[j] = v;
                    }
                }
            }
            if (!!spoiler && !!spoiler.data) {
                SpoilerParser.parse(spoiler.data, settingsData);
                loadSpoilerButton.innerHTML = Language.translate('load-spoiler-button');
                spoiler = {};
            }
            BusyIndicator.unbusy();
        });
        const options = FileData.get("spoiler_options");
        SettingsBuilder.build(settings, options);
        
        // add preset choice
        const loadSpoilerRow = LOAD_SPOILER.generate();
        const loadSpoilerWrapper = loadSpoilerRow.getElementById("options-spoiler-wrapper");
        loadSpoilerWrapper.style.display = "flex";
        loadSpoilerWrapper.style.flex = "1";
        const loadSpoilerButton = loadSpoilerRow.getElementById("load-spoiler-preset");
        loadSpoilerButton.innerHTML = Language.translate('load-spoiler-button');


        loadSpoilerButton.addEventListener('click', () => {
            loadSpoiler(loadSpoilerButton);
        });

        settings.shadowRoot.getElementById("footer").prepend(loadSpoilerRow)
    }

    show() {
        const options = FileData.get("spoiler_options");
        const res = {};
        for (const i in options) {
            res[i] = res[i] || {};
            for (const j in options[i]) {
                const opt = options[i][j];
                if (opt.type === "list") {
                    const def = new Set(opt.default);
                    const val = [];
                    for (const el of opt.values) {
                        if (StateStorage.readExtra("parseSpoiler", el, def.has(el))) {
                            val.push(el);
                        }
                    }
                    res[i][j] = val;
                } else {
                    res[i][j] = StateStorage.readExtra("parseSpoiler", j, opt.default);
                }
            }
        }
        settings.show(res/*, Object.keys(options)[0]*/);
    }

}
