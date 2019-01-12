/*
    starting point for application
*/

import "./third-party/custom-elements.min.js";

import EventBus from "deepJS/util/EventBus.mjs";
import Logger from "deepJS/util/Logger.mjs";

import loadData from "util/loader.mjs";
import I18n from "util/I18n.mjs";
import "util/SaveHandler.mjs";

import "ui/items/ItemGrid.mjs";
import "ui/dungeonstate/DungeonState.mjs";
import "ui/locations/LocationView.mjs";
import "ui/map/Map.mjs";

import "deepJS/ui/Dialog.mjs";
import "deepJS/ui/Icon.mjs";
import "deepJS/ui/selection/ChoiceSelect.mjs";

(async function main() {
    Logger.setOutput(document.getElementById("tracker-log"));

    await loadData();
    await I18n.load("en_us");

    addModule('ootrt-itemgrid', "item-grid");
    addModule('ootrt-dungeonstate', "dungeon-status").setAttribute("active", "key bosskey map compass type reward");
    addModule('ootrt-locationview', "location-list").setAttribute("mode", "chests");
    addModule('ootrt-map', "location-map").setAttribute("mode", "chests");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({oldValue:"",newValue:document.getElementById("view-choice-bottom").value});
    EventBus.logEvents(true);

    await import("ui/shops/ShopList.mjs");
    await import("ui/songs/SongList.mjs");
    await import("util/Settings.mjs");

    
    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

}());

document.getElementById("hamburger-button").onclick = function(event) {
    document.getElementById("menu").classList.toggle("open");
}

function addModule(name, target) {
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