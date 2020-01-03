import GlobalData from "/script/storage/GlobalData.js";
import SettingsWindow from "/deepJS/ui/SettingsWindow.js";
import PopOver from "/deepJS/ui/PopOver.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import SettingsStorage from "/script/storage/SettingsStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

import { buildSettings } from "/script/util/settings/SettingsBuilder.js";

import "/deepJS/ui/Paging.js";
import "/script/ui/UpdateHandler.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const SETTINGS_TPL = `
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
`;

function onSettingsEvent(event) {
    let settings = {};
    for (let i in event.data) {
        for (let j in event.data[i]) {
            if (i === "settings") {
                SettingsStorage.set(j, event.data[i][j]);
            } else {
                if (j === "tricks" || j === "trials" || j === "known_sequence_breaks") {
                    let v = event.data[i][j];
                    if (v.length > 0) {
                        v = new Set(v.split(","));
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            StateStorage.write(`${i}.${el}`, v.has(el));
                        });
                    } else {
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            StateStorage.write(`${i}.${el}`, false);
                        });
                    }
                } else {
                    StateStorage.write(`${i}.${j}`, event.data[i][j]);
                }
            }
        }
        if (i !== "settings") {
            settings[i] = event.data[i];
        }
    }
    applySettingsChoices();
    return settings;
}

async function getSetting(cat, name, def) {
    if (cat == "settings") {
        return await SettingsStorage.get(name, def);
    } else {
        return StateStorage.read(`${cat}.${name}`, def);
    }
}

async function getSettings() {
    let options = GlobalData.get("settings");
    let res = {};
    for (let i in options) {
        res[i] = res[i] || {};
        for (let j in options[i]) {
            let opt = options[i][j];
            if (opt.type === "list") {
                let def = new Set(opt.default);
                let val = [];
                for (let el of opt.values) {
                    if (await getSetting(i, el, def.has(el))) {
                        val.push(el);
                    }
                }
                res[i][j] = val;
            } else {
                res[i][j] = await getSetting(i, j, opt.default);
            }
        }
    }
    return res;
}
    
async function applySettingsChoices() {
    let viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", await SettingsStorage.get("font", ""));
    document.querySelector("#layout-container").setAttribute("layout", await SettingsStorage.get("layout", "map-compact"));
    document.body.style.setProperty("--item-size", await SettingsStorage.get("itemsize", 40));
    if (await SettingsStorage.get("show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (await SettingsStorage.get("use_custom_logic", false)) {
        GlobalData.set("logic_patched", await SettingsStorage.get("logic", {}));
    }
    let autosaveMax = await SettingsStorage.get("autosave_amount", 1);
    let autosaveTime = await SettingsStorage.get("autosave_time", 0);
    StateStorage.setAutosave(autosaveTime, autosaveMax);
}

let showUpdatePopup = false;

class Settings {

    init() {
        settings.innerHTML = SETTINGS_TPL;

        settings.querySelector("#tracker-version").innerHTML = GlobalData.get("version-string");
        settings.querySelector("#tracker-date").innerHTML = GlobalData.get("version-date");

        let updatehandler = settings.querySelector("#updatehandler");
        updatehandler.addEventListener("updateavailable", function() {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                let popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", async function() {
                    settings.show(await getSettings(), 'about');
                });
            }
        });
        updatehandler.addEventListener("noconnection", function() {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });

        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            EventBus.trigger("settings", onSettingsEvent(event));
            BusyIndicator.unbusy();
        });
        EventBus.register("settings", onSettingsEvent);
        
        settings.addEventListener('close', function(event) {
            showUpdatePopup = true;
        });

        buildSettings(settings);

        applySettingsChoices();

        showUpdatePopup = true;
        updatehandler.checkUpdate();
    }

    async show() {
        showUpdatePopup = false;
        settings.show(await getSettings(), 'settings');
    }

}

export default new Settings;