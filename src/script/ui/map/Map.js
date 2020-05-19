import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import Language from "/script/util/Language.js";
import World from "/script/util/World.js";
import "./marker/Area.js";
import "./marker/Entrance.js";
import "./marker/Location.js";
import "./marker/Gossipstone.js";
import "/script/ui/dungeonstate/DungeonType.js";
import "/script/ui/FilterMenu.js";

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;
const ZOOM_DEF = 60;
const ZOOM_SPD = 2;

//TODO save map settings per map

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: grid;
            min-width: 100%;
            min-height: 100%;
            width: 400px;
            height: 200px;
            -moz-user-select: none;
            user-select: none;
        }
        #map-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        #map {
            display: block;
            width: 1000px;
            height: 1000px;
            flex-shrink: 0;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            transform-origin: center;
            transform: translate(calc(var(--map-offset-x, 0) * 1px), calc(var(--map-offset-y, 0) * 1px)) scale(calc(var(--map-zoom, 100) / 100));
        }
        #map-settings {
            position: absolute;
            display: flex;
            flex-direction: column;
            left: 0;
            bottom: -180px;
            width: 250px;
            height: 180px;
            font-family: Arial, sans-serif;
            background-color: #000000;
            border-style: solid;
            border-width: 2px;
            border-color: var(--page-border-color-inverted, #ffffff);
            transition: bottom 1s;
        }
        #map-settings.active {
            bottom: 0;
        }
        .buttons {
            position: absolute;
            display: flex;
            left: 0;
            top: -42px;
            height: 40px;
        }
        .buttons > .button-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            margin-right: 8px;
            font-size: 30px;
            font-weight: bold;
            color: var(--navigation-text-color, #000000);
            background: var(--navigation-background-color, #ffffff);
        }
        .buttons > .button-wrapper > .button {
            width: 36px;
            height: 36px;
            padding: 4px;
            background-color: black;
            border-radius: 10px;
        }
        #toggle-button {
            cursor: pointer;
        }
        .map-options {
            display: flex;
            align-items: center;
            flex: 1;
            padding: 0 8px;
        }
        #map-overview {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 138px;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            overflow: hidden;
        }
        #map-viewport {
            background-color: rgba(255,255,255,0.2);
            flex-shrink: 0;
            border: solid 2px red;
            pointer-events: none;
        }
        #map-scale-slider {
            -webkit-appearance: none;
            flex: 1;
            height: 7px;
            margin-left: 0 0 0 8px;
        }
        #map-scale-slider:focus {
            outline: none;
        }
        #map-scale-slider::-webkit-slider-runnable-track,
        #map-scale-slider::-moz-range-track {
            width: 100%;
            height: 100%;
            cursor: pointer;
            background: #cb9c3d;
            border: none;
            border-radius: 0px;
        }
        #map-scale-slider::-webkit-slider-thumb,
        #map-scale-slider::-moz-range-thumb {
            -webkit-appearance: none;
            height: 100%;
            width: 10px;
            cursor: pointer;
            margin-top: 0px;
            background-color: #000000;
            border: none;
            border-radius: 0px;
        }
        #back {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 10px;
            top: 10px;
            min-width: 200px;
            min-height: 45px;
            padding: 5px;
            color: #ffffff;
            background-color: #000000;
            border-style: solid;
            border-width: 2px;
            border-color: var(--page-border-color-inverted, #ffffff);
            font-family: Arial, sans-serif;
            cursor: pointer;
        }
        #back:hover {
            background-color: var(--dungeon-status-hover-color, #ffffff32);
        }
        :host(:not([ref])) #back,
        :host([ref=""]) #back,
        :host([ref="#"]) #back {
            display: none;
        }
    </style>
    <div id="map-wrapper">
        <slot id="map" style="--map-zoom: ${ZOOM_DEF};">
        </slot>
        <div id="back">(${Language.translate("back")})</div>
        <div id="map-settings">
            <div class="buttons">
                <div id="toggle-button" class="button-wrapper">⇑</div>
                <div class="button-wrapper">
                    <emc-switchbutton id="location-mode" class="button" value="filter.chests">
                        <emc-option value="filter.chests" style="background-image: url('images/icons/chest.svg')"></emc-option>
                        <emc-option value="filter.skulltulas" data-filter="filter.skulltulas" style="background-image: url('images/icons/skulltula.svg')"></emc-option>
                        <emc-option value="filter.gossipstones" data-filter="filter.gossipstones" style="background-image: url('images/icons/gossipstone.svg')"></emc-option>
                    </emc-switchbutton>
                </div>
                <!-- dungeon type button
                <div class="button-wrapper">
                    <ootrt-dungeontype id="location-version" class="button" ref="" value="v" readonly="true">
                    </ootrt-dungeontype>
                </div>
                -->
                <div class="button-wrapper">
                    <ootrt-filtermenu class="button map-menu">
                    </ootrt-filtermenu>
                </div>
            </div>
            <div class="map-options">
                <span class="slidetext">- / +</span>
                <input type="range" min="${ZOOM_MIN}" max="${ZOOM_MAX}" value="${ZOOM_DEF}" class="slider" id="map-scale-slider">
            </div>
            <div class="map-options">
                <label><input type="checkbox" id="map-fixed" /> Map fixed</label>
            </div>
            <div id="map-overview">
                <div id="map-viewport">
                </div>
            </div>
        </div>
    </div>
`);

let movePosX = 0;
let movePosY = 0;

function mapMoveBegin(event) {
    if (event.button === 0) {
        let target = event.target;
        if (typeof event.movementX == "undefined") {
            movePosX = event.x;
            movePosY = event.y;
        }
        if (target.id === "map") {
            target.classList.add("grabbed");
            target.addEventListener("mousemove", moveMap);
            target.addEventListener("mouseup", mapMoveEnd);
            target.addEventListener("mouseleave", mapMoveEnd);
        }
    }
}

function mapMoveEnd(event) {
    if (event.button === 0) {
        let target = event.target;
        target.classList.remove("grabbed");
        target.removeEventListener("mousemove", moveMap);
        target.removeEventListener("mouseup", mapMoveEnd);
        target.removeEventListener("mouseleave", mapMoveEnd);
    }
}

function moveMap(event) {
    if (event.button === 0) {
        let target = event.target;
        if (target.id === "map") {
            let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
            let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
            let forceX = 0;
            let forceY = 0;
            if (typeof event.movementX == "undefined") {
                forceX = event.x - movePosX;
                forceY = event.y - movePosY;
                movePosX = event.x;
                movePosY = event.y;
            } else {
                forceX = event.movementX;
                forceY = event.movementY;
            }
            target.style.setProperty("--map-offset-x", vrtX + forceX);
            target.style.setProperty("--map-offset-y", vrtY + forceY);
            mapContainBoundaries(target, target.parentNode);
        }
    }
}

function mapContainBoundaries(target, parent) {
    let mapvp = parent.querySelector("#map-viewport");

    let parW = parent.clientWidth;
    let parH = parent.clientHeight;

    let zoom = parseInt(target.style.getPropertyValue("--map-zoom") || 100) / 100;

    let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
    let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
    let vrtW = target.clientWidth * zoom;
    let vrtH = target.clientHeight * zoom;

    if (parW > vrtW) {
        let dst = parW/2-vrtW/2;
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    } else {
        let dst = -(parW/2-vrtW/2);
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    }
    if (parH > vrtH) {
        let dst = parH/2-vrtH/2;
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    } else {
        let dst = -(parH/2-vrtH/2);
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    }

    target.style.setProperty("--map-offset-x", vrtX);
    target.style.setProperty("--map-offset-y", vrtY);

    let sW = 246 / vrtW * parW;
    let sH = 138 / vrtH * parH;
    mapvp.style.width = sW + "px";
    mapvp.style.height = sH + "px";
    mapvp.style.transform = `translate(${-vrtX * 246 / vrtW}px, ${-vrtY * 138 / vrtH}px)`;
}

function overviewSelect(event, map) {
    if (event.buttons === 1) {
        let evX = event.layerX;
        let evY = event.layerY;
        let zoom = parseInt(map.style.getPropertyValue("--map-zoom") || 100) / 100;
        let vrtW = map.clientWidth * zoom;
        let vrtH = map.clientHeight * zoom;
        map.style.setProperty("--map-offset-x", -(evX - 123) * (vrtW / 246));
        map.style.setProperty("--map-offset-y", -(evY - 69) * (vrtH / 138));
        mapContainBoundaries(map, map.parentNode);
    }
    event.preventDefault();
    return false;
};

class HTMLTrackerMap extends EventBusSubsetMixin(Panel) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById('location-mode').addEventListener("change", event => {
            this.mode = event.newValue;
            this.triggerGlobal("location_mode", {
                value: this.mode
            });
        });
        this.shadowRoot.getElementById('back').addEventListener("click", event => {
            this.ref = ""
        });
        // map specifics
        let map = this.shadowRoot.getElementById("map");
        let mapslide = this.shadowRoot.getElementById("map-scale-slider");
        let mapfixed = this.shadowRoot.getElementById("map-fixed");
        this.addEventListener("wheel", function(event) {
            if (!mapfixed.checked) {
                let zoom = parseInt(map.style.getPropertyValue("--map-zoom") || 100);
                const delta = Math.sign(event.deltaY) * ZOOM_SPD;
                zoom = Math.min(Math.max(ZOOM_MIN, zoom - delta), ZOOM_MAX);
                mapslide.value = zoom;
                map.style.setProperty("--map-zoom", zoom);
                mapContainBoundaries(map, map.parentNode);
            }
            event.preventDefault();
            return false;
        });
        mapslide.addEventListener("input", function(event) {
            if (!mapfixed.checked) {
                map.style.setProperty("--map-zoom", mapslide.value);
                mapContainBoundaries(map, map.parentNode);
            }
            event.preventDefault();
            return false;
        });
        map.addEventListener("mousedown", function(event) {
            if (!mapfixed.checked) {
                mapMoveBegin(event);
            }
            event.preventDefault();
            return false;
        });
        window.addEventListener("resize", function(event) {
            mapContainBoundaries(map, map.parentNode);
        });
        let mapview = this.shadowRoot.getElementById("map-overview");
        mapview.addEventListener("mousedown", function(event) {
            if (!mapfixed.checked) {
                overviewSelect(event, map);
            }
            event.preventDefault();
            return false;
        });
        mapview.addEventListener("mousemove", function(event) {
            if (!mapfixed.checked) {
                overviewSelect(event, map);
            }
            event.preventDefault();
            return false;
        });
        let settings = this.shadowRoot.getElementById("map-settings");
        let toggle = this.shadowRoot.getElementById("toggle-button");
        toggle.addEventListener("click", function(event) {
            if (settings.classList.contains("active")) {
                settings.classList.remove("active");
                toggle.innerHTML = "⇑";
            } else {
                mapContainBoundaries(map, map.parentNode);
                settings.classList.add("active");
                toggle.innerHTML = "⇓";
            }
            event.preventDefault();
            return false;
        });
        /* event bus */
        this.registerGlobal("location_change", event => {
            this.ref = event.data.name;
        });
        this.registerGlobal("location_mode", event => {
            this.mode = event.data.value;
            this.shadowRoot.getElementById('location-mode').value = this.mode;
        });
        this.registerGlobal(["state", "settings", "randomizer_options", "filter"], event => {
            if (this.ref == "#") {
                let modeEl = this.shadowRoot.getElementById('location-mode');
                let opts = modeEl.querySelectorAll("[data-filter]");
                for (let opt of opts) {
                    if (FilterStorage.get(opt.dataset.filter) == "true") {
                        // LEGACY
                        opt.removeAttribute("disabled");
                    } else {
                        // LEGACY
                        opt.setAttribute("disabled", true);
                        if (this.mode == opt.dataset.filter) {
                            modeEl.value = "filter.chests";
                            this.setAttribute('mode', "filter.chests");
                        }
                    }
                }
            }
            this.refresh();
        });
        this.registerGlobal("dungeontype", event => {
            if (this.ref === event.data.name) {
                this.refresh();
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.ref == "#") {
            let modeEl = this.shadowRoot.getElementById('location-mode');
            let opts = modeEl.querySelectorAll("[data-filter]");
            for (let opt of opts) {
                if (FilterStorage.get(opt.dataset.filter) == "true") {
                    // LEGACY
                    opt.removeAttribute("disabled");
                } else {
                    // LEGACY
                    opt.setAttribute("disabled", true);
                    if (this.mode == opt.dataset.filter) {
                        modeEl.value = "filter.chests";
                        this.setAttribute('mode', "filter.chests");
                    }
                }
            }
        }
        this.refresh();
    }

    get ref() {
        //return this.getAttribute('ref') || "";
        return "#";
    }

    set ref(val) {
        //this.setAttribute('ref', val);
        this.setAttribute('ref', "#");
    }

    get mode() {
        return this.getAttribute('mode') || "filter.chests";
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    static get observedAttributes() {
        return ['ref', 'mode'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (name == "ref") {
                //this.shadowRoot.getElementById("location-version").ref = newValue;
            }
            this.refresh();
        }
    }

    async refresh() {
        let dType = "v";//this.shadowRoot.getElementById("location-version").value;
        this.innerHTML = "";
        let data = FileData.get(`world_lists/${this.ref}`);
        if (!!data) {
            // switch map/minimap background
            let map = this.shadowRoot.getElementById('map');
            map.style.backgroundImage = `url("/images/maps/${data.background}")`;
            map.style.width = `${data.width}px`;
            map.style.height = `${data.height}px`;
            let minimap = this.shadowRoot.getElementById('map-overview');
            minimap.style.backgroundImage = `url("/images/maps/${data.background}")`;
            // fill map
            if (dType == "n") {

                let data_v = data.lists.v;
                let data_m = data.lists.mq;
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                // TODO add dungeonType initialization choice
                //btn_vanilla.className = VALUE_STATES[res_v.value];
                //btn_masterquest.className = VALUE_STATES[res_m.value];

            } else {
                data.lists[dType].forEach(record => {
                    if (this.ref == "#" && this.mode == "filter.gossipstones") {
                        // LEGACY
                        if (record.type == "area" || record.type == "entrance") {
                            return;
                        }
                    }
                    let loc = World.getLocation(record.id);
                    if (!!loc && loc.visible()) {
                        let el = loc.mapMarker;
                        if (this.ref == "#" && !!el.dataset.mode && el.dataset.mode != this.mode) {
                            // LEGACY
                            return;
                        }
                        el.left = record.x;
                        el.top = record.y;
                        el.tooltip = calculateTooltipPosition(record.x, record.y, data.width, data.height);
                        this.append(el);
                    }
                });
            }
        }
    }

}

Panel.registerReference("location-map", HTMLTrackerMap);
customElements.define('ootrt-map', HTMLTrackerMap);

function calculateTooltipPosition(posX, posY, mapW, mapH) {
    let leftP = posX / mapW;
    let topP = posY / mapH;
    let tooltip = "";
    if (topP < 0.3) {
        tooltip = "bottom";
    } else if (topP > 0.7) {
        tooltip = "top";
    }
    if (leftP < 0.3) {
        tooltip += "right";
    } else if (leftP > 0.7) {
        tooltip += "left";
    }
    return tooltip || "top";
}