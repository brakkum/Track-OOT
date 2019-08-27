import GlobalData from "/script/storage/GlobalData.js";
import SettingsWindow from "/deepJS/ui/SettingsWindow.js";
import PopOver from "/deepJS/ui/PopOver.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import SaveState from "/script/storage/SaveState.js";

import { buildSettings } from "/script/util/settings/SettingsBuilder.js";

import "/deepJS/ui/Paging.js";
import "/script/ui/UpdateHandler.js";

const settings = new SettingsWindow;

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
<i class="thanks-name">Luigimeansme</i> for helping with adding Master Quest.
</div>
`;

function initializeVersion() {
    let data = GlobalData.get("version");
    let version = settings.querySelector("#tracker-version");
    let date = settings.querySelector("#tracker-date");
    if (data.dev) {
        version.innerHTML = `DEV [${data.commit.slice(0,7)}]`;
    } else {
        version.innerHTML = data.version;
    }
    let b = new Date(data.date);
    let m = b.getMonth()+1;
    let d = {
        D: ("00"+b.getDate()).slice(-2),
        M: ("00"+m).slice(-2),
        Y: b.getFullYear(),
        h: ("00"+b.getHours()).slice(-2),
        m: ("00"+b.getMinutes()).slice(-2),
        s: ("00"+b.getSeconds()).slice(-2)
    };
    date.innerHTML = `${d.D}.${d.M}.${d.Y} ${d.h}:${d.m}:${d.s}`;
}

function onSettingsEvent(event) {
    let settings = {};
    for (let i in event.data) {
        for (let j in event.data[i]) {
            if (i === "settings") {
                TrackerStorage.SettingsStorage.set(j, event.data[i][j]);
            } else {
                if (j === "tricks" || j === "trials") {
                    let v = event.data[i][j];
                    if (v.length > 0) {
                        v = new Set(v.split(","));
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            SaveState.write(`${i}.${el}`, v.has(el));
                        });
                    } else {
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            SaveState.write(`${i}.${el}`, false);
                        });
                    }
                } else {
                    SaveState.write(`${i}.${j}`, event.data[i][j]);
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

async function getSettings() {
    let options = GlobalData.get("settings");
    let res = {};
    for (let i in options) {
        res[i] = res[i] || {};
        for (let j in options[i]) {
            if (options[i][j].type === "hidden") continue;
            if (i === "settings") {
                if (options[i][j].type === "list") {
                    let def = new Set(options[i][j].default);
                    let val = [];
                    for (let el of options[i][j].values) {
                        if (await TrackerStorage.SettingsStorage.get(el, def.has(el))) {
                            val.push(el);
                        }
                    }
                    res[i][j] = val.join(",");
                } else {
                    res[i][j] = await TrackerStorage.SettingsStorage.get(j, options[i][j].default);
                }
            } else {
                if (options[i][j].type === "list") {
                    let def = new Set(options[i][j].default);
                    let val = [];
                    options[i][j].values.forEach(el => {
                        if (SaveState.read(`${i}.${el}`, def.has(el))) {
                            val.push(el);
                        }
                    });
                    res[i][j] = val.join(",");
                } else {
                    res[i][j] = SaveState.read(`${i}.${j}`, options[i][j].default);
                }
            }
        }
    }
    return res;
}
    
async function applySettingsChoices() {
    let viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", await TrackerStorage.SettingsStorage.get("font", ""));
    document.querySelector("#layout-container").setAttribute("layout", await TrackerStorage.SettingsStorage.get("layout", "map-compact"));
    document.body.style.setProperty("--item-size", await TrackerStorage.SettingsStorage.get("itemsize", 40));
    if (await TrackerStorage.SettingsStorage.get("show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (await TrackerStorage.SettingsStorage.get("use_custom_logic", false)) {
        GlobalData.set("logic_patched", await TrackerStorage.SettingsStorage.get("logic", {}));
    }
}

class Settings {

    init() {
        settings.innerHTML = SETTINGS_TPL;

        settings.querySelector("#tracker-version").innerHTML = GlobalData.get("version-string");
        settings.querySelector("#tracker-date").innerHTML = GlobalData.get("version-date");

        let updatehandler = settings.querySelector("#updatehandler");
        let showUpdatePopup = false;
        updatehandler.addEventListener("updateavailable", function() {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                let popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", function() {
                    settings.show(getSettings(), 'about');
                });
            }
        });
        updatehandler.addEventListener("noconnection", function() {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });

        document.getElementById("join-discord").addEventListener("click", function() {
            window.open("https://discord.gg/wgFVtuv", "_blank");
        });
        
        document.getElementById("edit-settings").addEventListener("click", function() {
            showUpdatePopup = false;
            settings.show(getSettings(), 'settings');
        });

        settings.addEventListener('submit', function(event) {
            EventBus.trigger("settings", onSettingsEvent(event));
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

}

export default new Settings;