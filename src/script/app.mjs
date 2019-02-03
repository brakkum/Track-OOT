/*
    starting point for application
*/

import "/script/_vendor/custom-elements.min.js";

import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";

import loadData from "/script/util/loader.mjs";
import I18n from "/script/util/I18n.mjs";
import "/script/util/SaveHandler.mjs";

import "/script/ui/items/ItemGrid.mjs";
import "/script/ui/dungeonstate/DungeonState.mjs";
import "/script/ui/locations/LocationList.mjs";
import "/script/ui/map/Map.mjs";

import "/deepJS/ui/Dialog.mjs";
import "/deepJS/ui/Icon.mjs";
import "/deepJS/ui/selection/ChoiceSelect.mjs";

(async function main() {
    Logger.setOutput(document.getElementById("tracker-log"));

    await loadData();
    await I18n.load("en_us");

    addHTMLModule('ootrt-itemgrid', "item-grid");
    addHTMLModule('ootrt-dungeonstate', "dungeon-status").setAttribute("active", "key bosskey map compass type reward");
    addHTMLModule('ootrt-locationlist', "location-list").setAttribute("mode", "chests");
    addHTMLModule('ootrt-map', "location-map").setAttribute("mode", "chests");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({oldValue:"",newValue:document.getElementById("view-choice-bottom").value});
    EventBus.logEvents(true);

    await Promise.all([
        importModule("/script/ui/shops/ShopList.mjs"),
        importModule("/script/ui/songs/SongList.mjs"),
        importModule("/script/ui/LayoutContainer.mjs"),
        importModule("/script/util/Settings.mjs")
    ]);

    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

}());

document.getElementById("hamburger-button").onclick = function(event) {
    document.getElementById("menu").classList.toggle("open");
}

function importModule(url) {
    return new Promise((res, rej) => {
        let t = document.createElement("script");
        t.src = url;
        t.type = "module";
        t.onload = e => res(t);
        t.onerror = rej;
        document.head.appendChild(t);
    });
}

function addHTMLModule(name, target) {
    let el = document.createElement(name);
    document.getElementById(target).appendChild(el);
    return el;
}

function changeView(event) {
    let o = document.querySelector(`#content #view-${event.oldValue}`);
    if (!!o) {
        o.classList.remove('active');
    }
    let n = document.querySelector(`#content #view-${event.newValue}`);
    if (!!n) {
        n.classList.add('active');
    }
    document.getElementById("view-choice-top").value = event.newValue;
    document.getElementById("view-choice-bottom").value = event.newValue;
}