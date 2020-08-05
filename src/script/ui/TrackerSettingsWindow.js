import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import SettingsWindow from "/emcJS/ui/SettingsWindow.js";
import PopOver from "/emcJS/ui/PopOver.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Dialog from "/emcJS/ui/Dialog.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";

const SettingsStorage = new IDBStorage('settings');

import SettingsBuilder from "/script/util/SettingsBuilder.js";

import "/emcJS/ui/Paging.js";
import "/script/ui/UpdateHandler.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const ABOUT_TPL = new Template(`
<div style="display: flex; margin-bottom: 10px;">
    <div style="flex: 1">
        <div style="padding: 5px;">
            Tracker Version:
            <span id="tracker-version">DEV</span>
        </div>
        <div style="padding: 5px;">
            Version Date:
            <span id="tracker-date">01.01.2019 00:00:00</span>
        </div>
        <div style="padding: 5px;">
            <a href="CHANGELOG.MD" target="_BLANK">see the changelog</a>
        </div>
        <hr>
        <ootrt-updatehandler id="updatehandler"></ootrt-updatehandler>
    </div>
    <div style="width: 200px; height: 200px; background-image: url('images/logo.svg'); background-size: contain; background-position: left; background-repeat: no-repeat;"></div>
</div>
<hr>
<div>
    Please be aware, that the logic of this tracker (mostly) follows the randomizer logic.<br>
    This is due to the fact, that the logic of the randomizer is a good estimation of the logic of the game itself.<br>
    If the tracker acts weird, please <a href="https://bitbucket.org/zidargs/track-oot/issues" target="_blank" rel="noreferrer">report the error!</a><br><br>
    You can also report via Discord ▶ <a href="https://discord.gg/wgFVtuv" target="_blank" rel="noreferrer">Join my Discord!</a><br><br>
</div>
<hr>
<div>
Big thanks to:<br>
<i class="thanks-name">TestRunner</i> for creating the original tracker.<br>
<i class="thanks-name">Scatter</i> for building a logic compendium.<br>
<i class="thanks-name">fraggerman</i> for helping with the logic.<br>
<i class="thanks-name">Luigimeansme</i> for helping with adding Master Quest.<br>
<i class="thanks-name">pidgezero_one</i> for adding sequence breaks and extending skips.
</div>
`);

const LOAD_RULESET = new Template(`
<label class="settings-option">
    <span id="load-template-title" class="option-text"></span>
    <button id="load-template-button" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    <select id="select-template" class="settings-input" type="input"></select>
</label>
`)

async function getSettings() {
    let options = FileData.get("settings");
    let res = {};
    for (let i in options) {
        let opt = options[i];
        if (opt.type === "list" || opt.type === "-list") {
            let def = new Set(opt.default);
            let val = [];
            for (let el of opt.values) {
                if (await SettingsStorage.get(i, def.has(el))) {
                    val.push(el);
                }
            }
            res[i] = val;
        } else {
            res[i] = await SettingsStorage.get(i, opt.default);
        }
    }
    return res;
}
    
async function applySettingsChoices(settings) {
    let viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    document.body.style.setProperty("--item-size", settings.itemsize);
    StateStorage.setAutosave(settings.autosave_amount, settings.autosave_time);
}

async function showAbout() {
    settings.show({settings: await getSettings()}, 'about');
}

let showUpdatePopup = false;

export default class Settings {

    constructor() {
        let options = {
            settings: FileData.get("settings")
        };
        SettingsBuilder.build(settings, options);
        
        let settings_about = ABOUT_TPL.generate();
        settings_about.getElementById("tracker-version").innerHTML = MemoryStorage.get("version-string");
        settings_about.getElementById("tracker-date").innerHTML = MemoryStorage.get("version-date");
        let updatehandler = settings_about.getElementById("updatehandler");
        updatehandler.addEventListener("updateavailable", function() {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                let popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", showAbout);
            }
        });
        updatehandler.addEventListener("noconnection", function() {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });
        settings.addTab("About", "about");
        settings.addElements("about", settings_about);

        const loadRulesetRow = this.buildRulesetOptionsRow();
        settings.addElements("settings", loadRulesetRow);

        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            let settings = {};
            let options = FileData.get("settings");
            for (let i in event.data.settings) {
                let v = event.data.settings[i];
                if (Array.isArray(v)) {
                    v = new Set(v);
                    options[i].values.forEach(el => {
                        settings[el] = v.has(el);
                        SettingsStorage.set(el, v.has(el));
                    });
                } else {
                    settings[i] = v;
                    SettingsStorage.set(i, v);
                }
            }
            applySettingsChoices(settings);
            EventBus.trigger("settings", settings);
            BusyIndicator.unbusy();
        });
        
        settings.addEventListener('close', function(event) {
            showUpdatePopup = true;
        });

        getSettings().then(applySettingsChoices);

        showUpdatePopup = true;
        updatehandler.checkUpdate();
    }

    async show() {
        showUpdatePopup = false;
        settings.show({settings: await getSettings()}, 'settings');
    }

    buildRulesetOptionsRow = () => {
        const loadRulesetRow = LOAD_RULESET.generate();
        loadRulesetRow.getElementById("load-template-title").innerHTML = Language.translate('load-ruleset-title');
        const loadRulesetButton = loadRulesetRow.getElementById("load-template-button");
        loadRulesetButton.innerHTML = Language.translate('load-ruleset-button');
        
        const selector = loadRulesetRow.getElementById("select-template");
        const allRulesets = Object.keys(FileData.get("rulesets"));
        for (let value of allRulesets) {
            let opt = document.createElement('option');
            opt.value = value;
            opt.innerHTML = Language.translate(value);
            selector.append(opt);
        }

        loadRulesetButton.addEventListener('click', () => {
            const ruleset = settings.shadowRoot.getElementById("select-template").value;
            this.setOptionsFromRuleset(ruleset);
        })

        return loadRulesetRow
    }

    setOptionsFromRuleset = name => {
        const ruleset = FileData.get("rulesets")[name];
        if (!ruleset) { return }
    
        let settings = {};
        for (let i in ruleset) {
            for (let j in ruleset[i]) {
                let v = ruleset[i][j];
                settings[j] = v;
            }
        }
        StateStorage.write(settings);
        EventBus.trigger("randomizer_options", settings);
      }

}