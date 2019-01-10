import GlobalData from "deepJS/storage/GlobalData.mjs";
import DeepLocalStorage from "deepJS/storage/LocalStorage.mjs";
import SettingsWindow from "deepJS/ui/SettingsWindow.mjs";
import EventBus from "deepJS/util/EventBus.mjs";
import TrackerLocalState from "./LocalState.mjs";
import I18n from "./I18n.mjs";

const settings = new SettingsWindow;
const settingsEdit = document.getElementById("edit-settings");

settings.innerHTML = `
<div style="display: flex; margin-bottom: 10px;">
    <div style="flex: 1">
        Tracker Version: <span id="tracker-version">DEV [00000000000000]</span>
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

settingsEdit.addEventListener("click", function() {
    settings.show(getSettings(), 'settings');
});

settings.addEventListener('submit', function(event) {
    for (let i in event.data) {
        for (let j in event.data[i]) {
            if (i === "settings") {
                DeepLocalStorage.set(i, j, event.data[i][j]);
            } else {
                TrackerLocalState.write(i, j, event.data[i][j]);
            }
        }
    }
    applySettingsChoices();
    EventBus.post("global-update");
});

function getSettings() {
    let options = GlobalData.get("settings");
    let res = {};
    for (let i in options) {
        res[i] = res[i] || {};
        if (i === "settings") {
            for (let j in options[i]) {
                res[i][j] = DeepLocalStorage.get(i, j, options[i][j].default);
            }
        } else {
            for (let j in options[i]) {
                res[i][j] = TrackerLocalState.read(i, j, options[i][j].default);
            }
        }
    }
    return res;
}
    
function applySettingsChoices() {
    var viewpane = document.getElementById("viewpane");
    viewpane.setAttribute("data-font", DeepLocalStorage.get("settings", "font", ""));
    var layout_container = document.querySelector(".layout-container[data-layout]");
    layout_container.setAttribute("data-layout", DeepLocalStorage.get("settings", "layout", "map-compact"));
    layout_container.style.setProperty("--item-size", DeepLocalStorage.get("settings", "itemsize", 40));
    if (DeepLocalStorage.get("settings", "show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (TrackerLocalState.read("options", "scrubsanity", false)) {
        document.body.setAttribute("data-scrubsanity", "true");
    } else {
        document.body.setAttribute("data-scrubsanity", "false");
    }
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
                    let opt = {};
                    for (let k in val.values) {
                        opt[val.values[k]] = I18n.translate(val.values[k]);
                    }
                    settings.addChoiceInput(i, label, j, val.default, opt);
                break;
                case "button":
                    if (j == "edit_custom_logic") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {
                            window.open("editor.html", '_blank');
                        });
                    } else if (j == "erase_all_data") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {});
                    }
                break;
            }
        }
    }
    applySettingsChoices();
}();
