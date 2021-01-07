
import Template from "/emcJS/util/Template.js";
import SettingsWindow from "/emcJS/ui/overlay/SettingsWindow.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import FileData from "/emcJS/storage/FileData.js";
import "/emcJS/ui/Paging.js";

import StateStorage from "/script/storage/StateStorage.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import SettingsBuilder from "/script/util/SettingsBuilder.js";
import Language from "/script/util/Language.js";

const settings = new SettingsWindow;
let items = null;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const LOAD_RULESET = new Template(`
    <div id="options-preset-wrapper">
        <select id="select-options-preset" class="settings-input" type="input"></select>
        <button id="load-options-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);
        
function setOptionsFromRuleset(name) {
    const ruleset = FileData.get("rulesets")["current"][name];
    items = {};
    if (!ruleset) { return }

    for (const i in ruleset) {
        let panel = null;
        if (i !== "items") panel = settings.shadowRoot.querySelector(`.panel[data-ref="${i}"]`);
        for (const j in ruleset[i]) {
            if (i === "items") {
                items[j] = ruleset[i][j];
            } else {
                const opt = panel.querySelector(`[data-ref="${j}"]`);
                if (opt != null) {
                    if (opt.type === "checkbox") {
                        opt.checked = ruleset[i][j];
                    } else {
                        opt.value = ruleset[i][j];
                    }
                }
            }
        }
    }
}

export default class RomSettings {

    constructor() {
        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            const settings = {};
            const options = FileData.get("randomizer_options");
            for (const i in event.data) {
                for (const j in event.data[i]) {
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
            if (items !== null) {
                for (const i in items) {
                    settings[i] = items[i];
                }
            }
            StateStorage.write(settings);
            EventBus.trigger("randomizer_options", settings);
            BusyIndicator.unbusy();
        });
        const options = FileData.get("randomizer_options");
        SettingsBuilder.build(settings, options);
        
        // add preset choice
        const loadRulesetRow = LOAD_RULESET.generate();
        const loadRulesetWrapper = loadRulesetRow.getElementById("options-preset-wrapper");
        loadRulesetWrapper.style.display = "flex";
        loadRulesetWrapper.style.flex = "1";
        const loadRulesetButton = loadRulesetRow.getElementById("load-options-preset");
        loadRulesetButton.innerHTML = Language.translate('load-preset-button');
        
        const selector = loadRulesetRow.getElementById("select-options-preset");
        selector.style.width = "20%";
        const allRulesets = Object.keys(FileData.get("rulesets")['current']);
        for (const value of allRulesets) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.innerHTML = value;
            selector.append(opt);
        }

        loadRulesetButton.addEventListener('click', () => {
            const ruleset = settings.shadowRoot.getElementById("select-options-preset").value;
            setOptionsFromRuleset(ruleset);
        });

        settings.shadowRoot.getElementById("footer").prepend(loadRulesetRow)
    }

    show() {
        const options = FileData.get("randomizer_options");
        const res = {};
        for (const i in options) {
            res[i] = res[i] || {};
            for (const j in options[i]) {
                const opt = options[i][j];
                if (opt.type === "list") {
                    const def = new Set(opt.default);
                    const val = [];
                    for (const el of opt.values) {
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
        items = null;
        settings.show(res/*, Object.keys(options)[0]*/);
    }

}
