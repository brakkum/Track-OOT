
import Template from "/emcJS/util/Template.js";
import SettingsWindow from "/emcJS/ui/SettingsWindow.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import FileData from "/emcJS/storage/FileData.js";
import "/emcJS/ui/Paging.js";

import StateStorage from "/script/storage/StateStorage.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import SettingsBuilder from "/script/util/SettingsBuilder.js";
import Language from "/script/util/Language.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const LOAD_RULESET = new Template(`
    <div id="options-preset-wrapper">
        <select id="select-options-preset" class="settings-input" type="input"></select>
        <button id="load-options-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);
        
function setOptionsFromRuleset(name) {
    const ruleset = FileData.get("rulesets")[name];
    if (!ruleset) { return }

    for (let i in ruleset) {
        let panel = settings.shadowRoot.querySelector(`.panel[data-ref="${i}"]`);
        for (let j in ruleset[i]) {
            let opt = panel.querySelector(`[data-ref="${j}"]`);
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

export default class RomSettings {

    constructor() {
        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            let settings = {};
            let options = FileData.get("randomizer_options");
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
        let options = FileData.get("randomizer_options");
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
        const allRulesets = Object.keys(FileData.get("rulesets"));
        for (let value of allRulesets) {
            let opt = document.createElement('option');
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
        let options = FileData.get("randomizer_options");
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