import GlobalData from "/deepJS/storage/GlobalData.mjs";
import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import SettingsWindow from "/deepJS/ui/SettingsWindow.mjs";
import {showPopover} from "/deepJS/ui/PopOver.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import TrackerLocalState from "./LocalState.mjs";
import I18n from "./I18n.mjs";

import "/deepJS/ui/Paging.mjs";

const settings = new SettingsWindow;
const settingsEdit = document.getElementById("edit-settings");

settings.innerHTML = `
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
        <div id="update-check" style="padding: 5px;">
            checking for new version...
        </div>
        <div id="update-available" style="padding: 5px; display: none;">
            newer version found <button id="download-update">download</button>
            <br>
            <a href="CHANGELOG.MD?nosw" target="_BLANK">see the changelog</a>
        </div>
        <div id="update-unavailable" style="padding: 5px; display: none;">
            already up to date <button id="check-update">check again</button>
        </div>
        <div id="update-running" style="padding: 5px; display: none;">
            <progress id="update-progress" value="0" max="0"></progress>
            <span id="update-progress-text">0/0</span>
        </div>
        <div id="update-finished" style="padding: 5px; display: none;">
            you need to reload for the new version to apply...
            <button onclick="window.location.reload()">reload now</button>
        </div>
        <div id="update-force" style="padding: 5px; display: none;">
            if files seem corrupt, you can try to 
            <button id="download-forced">force download</button>
        </div>
    </div>
    <div style="width: 200px; height: 200px; background-image: url('images/logo.svg'); background-size: contain; background-position: left; background-repeat: no-repeat;"></div>
</div>
<hr>
<div>
    Please be aware, that the logic of this tracker (mostly) follows the randomizer logic.<br>
    This is due to the fact, that the logic of the randomizer is a good estimation of the logic of the game itself.<br>
    If the tracker acts weird, please <a href="https://bitbucket.org/2deep4real/track-oot/issues" target="_blank" rel="noreferrer">report the error!</a><br><br>
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

!function() {
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
}();

let showUpdatePopup = true;

if ('serviceWorker' in navigator) {
    let prog = settings.querySelector("#update-progress");
    let progtext = settings.querySelector("#update-progress-text");
    //let checkUpdateTimeout = undefined;

    function swStateRecieve(event) {
        if (event.data.type == "state") {
            switch(event.data.msg) {
                case "update_available":
                    settings.querySelector("#update-check").style.display = "none";
                    settings.querySelector("#update-force").style.display = "block";
                    settings.querySelector("#update-available").style.display = "block";
                    if (showUpdatePopup) showPopover("A new update is available. Click here to download!", function() {
                        settings.show(getSettings(), 'about');
                    });
                break;
                case "update_unavailable":
                    settings.querySelector("#update-check").style.display = "none";
                    settings.querySelector("#update-force").style.display = "block";
                    settings.querySelector("#update-unavailable").style.display = "block";
                    //checkUpdateTimeout = setTimeout(checkUpdate, 600000);
                break;
                case "need_download":
                    prog.value = 0;
                    prog.max = event.data.value;
                    progtext.innerHTML = `${prog.value}/${prog.max}`;
                break;
                case "file_downloaded":
                    prog.value = parseInt(prog.value) + 1;
                    progtext.innerHTML = `${prog.value}/${prog.max}`;
                break;
                case "update_finished":
                    prog.value = 0;
                    prog.max = 0;
                    progtext.innerHTML = `0/0`;
                    settings.querySelector("#update-running").style.display = "none";
                    settings.querySelector("#update-finished").style.display = "block";
                break;
                case "error":
                    settings.querySelector("#update-check").style.display = "none";
                    settings.querySelector("#update-running").style.display = "none";
                    settings.querySelector("#update-finished").style.display = "none";
                    settings.querySelector("#update-force").style.display = "block";
                    settings.querySelector("#update-unavailable").style.display = "block";
                    Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.")
                break;
            }
        }
    }
    navigator.serviceWorker.addEventListener('message', swStateRecieve);
    function checkUpdate() {
        settings.querySelector("#update-unavailable").style.display = "none";
        settings.querySelector("#update-force").style.display = "none";
        settings.querySelector("#update-check").style.display = "block";
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.active.postMessage("check");
        });
    }
    checkUpdate();
    
    settings.querySelector("#check-update").onclick = function() {
        //clearTimeout(checkUpdateTimeout);
        checkUpdate();
    }

    settings.querySelector("#download-update").onclick = function() {
        settings.querySelector("#update-available").style.display = "none";
        settings.querySelector("#update-force").style.display = "none";
        settings.querySelector("#update-running").style.display = "block";
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.active.postMessage("update");
        });
    }

    settings.querySelector("#download-forced").onclick = function() {
        settings.querySelector("#update-available").style.display = "none";
        settings.querySelector("#update-force").style.display = "none";
        settings.querySelector("#update-unavailable").style.display = "none";
        settings.querySelector("#update-running").style.display = "block";
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.active.postMessage("forceupdate");
        });
    }

}

settingsEdit.addEventListener("click", function() {
    showUpdatePopup = false;
    settings.show(getSettings(), 'settings');
});

settings.addEventListener('submit', function(event) {
    for (let i in event.data) {
        for (let j in event.data[i]) {
            if (i === "settings") {
                DeepLocalStorage.set(i, j, event.data[i][j]);
            } else {
                if (j === "tricks" || j === "trials") {
                    let v = event.data[i][j];
                    if (v.length > 0) {
                        v = new Set(v.split(","));
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            TrackerLocalState.write(i, el, v.has(el));
                        });
                    } else {
                        GlobalData.get("settings")[i][j].values.forEach(el => {
                            TrackerLocalState.write(i, el, false);
                        });
                    }
                } else {
                    TrackerLocalState.write(i, j, event.data[i][j]);
                }
            }
        }
    }
    applySettingsChoices();
    EventBus.post("settings");
});

settings.addEventListener('close', function(event) {
    showUpdatePopup = true;
});

function getSettings() {
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
                    options[i][j].values.forEach(el => {
                        if (DeepLocalStorage.get(i, el, def.has(el))) {
                            val.push(el);
                        }
                    });
                    res[i][j] = val.join(",");
                } else {
                    res[i][j] = DeepLocalStorage.get(i, j, options[i][j].default);
                }
            } else {
                if (options[i][j].type === "list") {
                    let def = new Set(options[i][j].default);
                    let val = [];
                    options[i][j].values.forEach(el => {
                        if (TrackerLocalState.read(i, el, def.has(el))) {
                            val.push(el);
                        }
                    });
                    res[i][j] = val.join(",");
                } else {
                    res[i][j] = TrackerLocalState.read(i, j, options[i][j].default);
                }
            }
        }
    }
    return res;
}
    
function applySettingsChoices() {
    var viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", DeepLocalStorage.get("settings", "font", ""));
    document.querySelector("#layout-container").setAttribute("layout", DeepLocalStorage.get("settings", "layout", "map-compact"));
    document.body.style.setProperty("--item-size", DeepLocalStorage.get("settings", "itemsize", 40));
    if (DeepLocalStorage.get("settings", "show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
        GlobalData.set("logic_patched", DeepLocalStorage.get("settings", "logic", {}));
    }
}

function convertValueList(values = [], names = []) {
    let opt = {};
    for (let k in values) {
        if (names.hasOwnProperty(k)) {
            opt[values[k]] = I18n.translate(names[k]);
        } else {
            opt[values[k]] = I18n.translate(values[k]);
        }
    }
    return opt;
}

!function() {
    let options = GlobalData.get("settings");
    for (let i in options) {
        settings.addTab(I18n.translate(i), i);
        for (let j in options[i]) {
            let val = options[i][j];
            let label = I18n.translate(j);
            let min = parseFloat(val.min);
            let max = parseFloat(val.max);
            switch (val.type) {
                case "string":
                    settings.addStringInput(i, label, j, val.default);
                break;
                case "number":
                    settings.addNumberInput(i, label, j, val.default, min, max);
                break;
                case "range":
                    settings.addRangeInput(i, label, j, val.default, min, max);
                break;
                case "check":
                    settings.addCheckInput(i, label, j, val.default);
                break;
                case "choice":
                    settings.addChoiceInput(i, label, j, val.default, convertValueList(val.values, val.names));
                break;
                case "list":
                    settings.addListSelectInput(i, label, j, val.default.join(","), true, convertValueList(val.values, val.names));
                break;
                case "button":
                    if (j == "edit_custom_logic") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {
                            document.getElementById('view-pager').active = "editor";
                            settings.close();
                        });
                    } else if (j == "erase_all_data") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {
                            window.open("uninstall.html");
                        });
                    }
                break;
            }
        }
    }
    applySettingsChoices();
}();
