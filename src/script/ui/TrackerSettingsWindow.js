import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import SettingsWindow from "/emcJS/ui/overlay/SettingsWindow.js";
import PopOver from "/emcJS/ui/overlay/PopOver.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

function sortNames(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
    }
    return 1;
}

function createDevEntry(name, type) {
    const el = document.createElement('li');
    el.classList.add("name");
    el.classList.add(type);
    el.innerHTML = name;
    return el;
}

// TODO bind erase stored data button

const SettingsStorage = new IDBStorage('settings');

import SettingsBuilder from "/script/util/SettingsBuilder.js";

import "/emcJS/ui/Paging.js";
import "/script/ui/UpdateHandler.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const SUPPORTER_URL = new URL("/patreon", location);

if (location.hostname == "localhost") {
    SUPPORTER_URL.port = 10001;
}

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
`);

const CREDITS_TPL = new Template(`
<style>
    #credits {
        height: 400px;
        display: flex;
        color: white;
        overflow: hidden;
    }
    #credits .panel {
        display: block;
        flex: 1;
        padding: 10px;
        margin: 1px;
        background-color: #282828;
    }
    #credits ul {
        padding-inline-start: 10px;
    }
    #credits .title {
        font-size: 1.2em;
        font-weight: bold;
    }
    #credits .name {
        list-style: none;
        padding: 5px 0;
        font-size: 1.5em;
    }
    #credits .name.owner {
        color: #cb9c3d;
    }
    #credits .name.team {
        color: #ffdb00;
    }
    #credits .name.contributor {
        color: #ff2baa;
    }
    #credits #supporters .name {
        color: #a8a8a8;
    }
</style>
<div id="credits">
    <div class="panel">
        <label>
            <span class="title">Dev-Team</span>
            <ul id="team">
            </ul>
        </label>
        <label>
            <span class="title">Contributors</span>
            <ul id="contributor">
            </ul>
        </label>
    </div>
    <div class="panel" id="supporters">
    </div>
</div>
`);

function createSupporterPanel(title, data) {
    if (data != null && Array.isArray(data.names) && data.names.length > 0) {
        const res = document.createElement("label");
        const ttl = document.createElement("span");
        ttl.classList.add("title");
        ttl.innerHTML = title;
        const lst = document.createElement("ul");
        for (const name of new Set(data.names)) {
            const el = document.createElement("li");
            el.classList.add("name");
            el.innerHTML = name;
            el.style.color = data.color || "";
            lst.append(el);
        }
        res.append(ttl);
        res.append(lst);
        return res;
    }
}

async function getSettings() {
    const options = FileData.get("settings");
    const res = {};
    for (const i in options) {
        const opt = options[i];
        if (opt.type === "list" || opt.type === "-list") {
            const def = new Set(opt.default);
            const val = [];
            for (const el of opt.values) {
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
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    document.body.style.setProperty("--item-size", settings.itemsize);
    StateStorage.setAutosave(settings.autosave_amount, settings.autosave_time);
}

async function showAbout() {
    settings.show({ settings: await getSettings() }, 'about');
}

let showUpdatePopup = false;

export default class Settings {

    constructor() {
        const options = {
            settings: FileData.get("settings")
        };
        SettingsBuilder.build(settings, options);

        const settings_about = ABOUT_TPL.generate();
        settings_about.getElementById("tracker-version").innerHTML = MemoryStorage.get("version-string");
        settings_about.getElementById("tracker-date").innerHTML = MemoryStorage.get("version-date");
        const updatehandler = settings_about.getElementById("updatehandler");
        updatehandler.addEventListener("updateavailable", function() {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                const popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", showAbout);
            }
        });
        updatehandler.addEventListener("noconnection", function() {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });

        !async function() {
            const settings_credits = CREDITS_TPL.generate();

            const teamContainer = settings_credits.getElementById("team");
            const contributorContainer = settings_credits.getElementById("contributor");
            teamContainer.append(createDevEntry(MemoryStorage.get("devs-owner"), "owner"));
            const team = MemoryStorage.get("devs-team").sort(sortNames);
            team.forEach(name => {
                teamContainer.append(createDevEntry(name, "team"));
            });
            const contributors = MemoryStorage.get("devs-contributors").sort(sortNames);
            contributors.forEach(name => {
                contributorContainer.append(createDevEntry(name, "contributor"));
            });

            const supporters_list = settings_credits.getElementById("supporters");
            let supporters = LocalStorage.get("supporters", {});
            try {
                const r = await fetch(SUPPORTER_URL);
                if (r.status < 200 || r.status >= 300) {
                    throw new Error(`error loading patreon data - status: ${r.status}`);
                }
                supporters = await r.json();
                LocalStorage.set("supporters", supporters);
            } catch(err) {
                console.error(err);
            }
            for (const name in supporters) {
                const el = createSupporterPanel(name, supporters[name]);
                if (el != null) {
                    supporters_list.append(el);
                }
            }
            settings.addTab("Credits", "credits");
            settings.addElements("credits", settings_credits);

            // add about tab last
            settings.addTab("About", "about");
            settings.addElements("about", settings_about);
        }();


        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            const settings = {};
            const options = FileData.get("settings");
            for (const i in event.data.settings) {
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

        settings.addEventListener('close', function() {
            showUpdatePopup = true;
        });

        getSettings().then(applySettingsChoices);

        showUpdatePopup = true;
        updatehandler.checkUpdate();
    }

    async show() {
        showUpdatePopup = false;
        settings.show({ settings: await getSettings() }, 'settings');
    }

}
