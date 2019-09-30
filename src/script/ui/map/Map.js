import GlobalData from "/script/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import Panel from "/deepJS/ui/layout/Panel.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import "./POILocationChest.js";
import "./POILocationSkulltula.js";
import "./POIGossipstone.js";
import "./POIArea.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
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
            width: 820px;
            height: 460px;
            flex-shrink: 0;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            background-image: url("/images/map.png");
            transform-origin: center;
            transform: translate(calc(var(--map-offset-x, 0) * 1px), calc(var(--map-offset-y, 0) * 1px)) scale(var(--map-zoom, 1));
        }
        #map-settings {
            position: absolute;
            display: flex;
            flex-direction: column;
            right: 0;
            bottom: -180px;
            width: 250px;
            height: 180px;
            font-family: Arial, sans-serif;
            background-color: black;
            border-style: solid;
            border-width: 2px;
            border-color: var(--page-border-color-inverted, #ffffff);
            transition: bottom 1s;
        }
        #map-settings.active {
            bottom: 0;
        }
        #toggle-button {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            right: 0;
            top: -42px;
            width: 40px;
            height: 40px;
            font-size: 30px;
            font-weight: bold;
            color: var(--navigation-text-color, #000000);
            background: var(--navigation-background-color, #ffffff);
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
            background-image: url("/images/map.png");
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
            background: #000000;
            border: none;
            border-radius: 0px;
        }
    </style>
    <div id="map-wrapper">
        <slot id="map" style="--map-zoom: 1;">
        </slot>
        <div id="map-settings">
            <div id="toggle-button">⇑</div>
            <div class="map-options">
                <span class="slidetext">- / +</span>
                <input type="range" min="50" max="300" value="100" class="slider" id="map-scale-slider">
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

const LOCATION_ELEMENTS = new Map();

function generateLocations() {
    let data = GlobalData.get("locations");
    if (!!data.overworld && !!data.overworld.gossipstones_v) {
        for (let i in data.overworld.gossipstones_v) {
            let el = document.createElement('ootrt-poigossipstone');
            el.style.left = data.overworld.gossipstones_v[i].x;
            el.style.top = data.overworld.gossipstones_v[i].y;
            el.ref = i;
            LOCATION_ELEMENTS.set(`G:${i}`, el);
        }
    }
    for (let i in data) {
        if (data[i].spread) {
            if (!!data[i].chests_v) {
                for (let j in data[i].chests_v) {
                    let el = document.createElement('ootrt-poilocationchest');
                    el.style.left = data[i].chests_v[j].x;
                    el.style.top = data[i].chests_v[j].y;
                    el.ref = `${i}.chests_v.${j}`;
                    LOCATION_ELEMENTS.set(`${i}.chests_v.${j}`, el);
                }
            }
            if (!!data[i].skulltulas_v) {
                for (let j in data[i].skulltulas_v) {
                    let el = document.createElement('ootrt-poilocationskulltula');
                    el.style.left = data[i].skulltulas_v[j].x;
                    el.style.top = data[i].skulltulas_v[j].y;
                    el.ref = `${i}.skulltulas_v.${j}`;
                    LOCATION_ELEMENTS.set(`${i}.skulltulas_v.${j}`, el);
                }
            }
        } else {
            let el = document.createElement('ootrt-poiarea');
            el.style.left = data[i].x;
            el.style.top = data[i].y;
            el.ref = i;
            LOCATION_ELEMENTS.set(`A:${i}`, el);
        }
    }
}

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

    let zoom = parseFloat(target.style.getPropertyValue("--map-zoom") || 1);

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
        let zoom = parseFloat(map.style.getPropertyValue("--map-zoom") || 1);
        let vrtW = map.clientWidth * zoom;
        let vrtH = map.clientHeight * zoom;
        map.style.setProperty("--map-offset-x", -(evX - 123) * (vrtW / 246));
        map.style.setProperty("--map-offset-y", -(evY - 69) * (vrtH / 138));
        mapContainBoundaries(map, map.parentNode);
    }
    event.preventDefault();
    return false;
};

class HTMLTrackerMap extends Panel {

    constructor() {
        super();
        generateLocations();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        let map = this.shadowRoot.getElementById("map");
        let mapslide = this.shadowRoot.getElementById("map-scale-slider");
        let mapfixed = this.shadowRoot.getElementById("map-fixed");
        this.addEventListener("wheel", function(event) {
            if (!mapfixed.checked) {
                let zoom = parseFloat(map.style.getPropertyValue("--map-zoom") || 1);
                const delta = Math.sign(event.deltaY) / 50;
                zoom = Math.min(Math.max(0.5, zoom - delta), 3);
                mapslide.value = zoom * 100;
                map.style.setProperty("--map-zoom", zoom);
                mapContainBoundaries(map, map.parentNode);
            }
            event.preventDefault();
            return false;
        });
        mapslide.addEventListener("input", function(event) {
            if (!mapfixed.checked) {
                map.style.setProperty("--map-zoom", mapslide.value / 100);
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
        EVENT_BINDER.register("location_mode", event => this.mode = event.data.value);
        EVENT_BINDER.register("filter", event => {
            if (event.data.ref == "filter_era_active") {
                this.era = event.data.value
            }
        });
        EVENT_BINDER.register(["state", "settings"], event => this.attributeChangedCallback("", ""));
    }

    connectedCallback() {
        this.setAttribute("mode", "chests");
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    get era() {
        return this.getAttribute('era');
    }

    set era(val) {
        this.setAttribute('era', val);
    }

    static get observedAttributes() {
        return ['mode', 'era'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            this.innerHTML = "";
            if (!!this.mode && this.mode !== "") {
                if (this.mode === "gossipstones") {
                    let data = GlobalData.get("locations")["overworld"][`gossipstones_v`];
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            let buf = data[i];
                            if (!buf.era || !this.era || this.era === buf.era) {
                                let el = LOCATION_ELEMENTS.get(`G:${i}`);
                                this.append(el);
                            }
                        });
                    }
                } else {
                    let data = GlobalData.get("locations");
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            if (!!data[i].spread) {
                                let buff = GlobalData.get("locations")[i][`${this.mode}_v`];
                                if (!!buff) {
                                    Object.keys(buff).forEach(j => {
                                        let buf = buff[j];
                                        if (!buf.era || !this.era || this.era === buf.era) {
                                            if (!buf.mode || StateStorage.read(`options.${buf.mode}`, false)) {
                                                let el = LOCATION_ELEMENTS.get(`${i}.${this.mode}_v.${j}`);
                                                this.append(el);
                                            }
                                        }
                                    });
                                }
                            } else {
                                let el = LOCATION_ELEMENTS.get(`A:${i}`);
                                el.mode = this.mode;
                                this.append(el);
                            }
                        });
                    }
                }
            }
        }
    }

}

Panel.registerReference("location-map", HTMLTrackerMap);
customElements.define('ootrt-map', HTMLTrackerMap);