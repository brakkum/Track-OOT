import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import "./POILocation.mjs";
import "./POIGossipstone.mjs";
import "./POIArea.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 825px;
            min-height: 466px;
            user-select: none;
        }
        slot {
            display: block;
            width: 825px;
            height: 466px;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            background-image: url("/images/map.png");
            transform-origin: center;
            transform: translate(calc(var(--map-offset-x, 0) * 1px), calc(var(--map-offset-y, 0) * 1px)) scale(var(--map-zoom, 1));
        }
    </style>
    <slot id="map" style="--map-zoom: 1;">
    </slot>
`);

function mapMoveBegin(event) {
    if (event.button === 0) {
        let target = event.target;
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
    // TODO clip translation to boundaries
    if (event.button === 0) {
        let target = event.target;
        if (target.id === "map") {
            let parent = target.parentNode.host;
            mapContainBoundaries(target, parent, event.movementX, event.movementY);
        }
    }
}

function mapContainBoundaries(target, parent, moveX = 0, moveY = 0, zoomD = 0) {
    let parW = parent.clientWidth;
    let parH = parent.clientHeight;

    let zoom = parseFloat(target.style.getPropertyValue("--map-zoom") || 1);
    if (zoomD != 0) {
        zoom = Math.min(Math.max(0.5, zoom - zoomD), 3);
        target.style.setProperty("--map-zoom", zoom);
    }

    let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
    let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
    let vrtW = target.clientWidth * zoom;
    let vrtH = target.clientHeight * zoom;

    if (moveX != 0 || zoomD != 0) {
        if (parW > vrtW) {
            let dst = parW/2-vrtW/2;
            vrtX = Math.min(Math.max(-dst, vrtX + moveX), dst);
        } else {
            let dst = -(parW/2-vrtW/2);
            vrtX = Math.min(Math.max(-dst, vrtX + moveX), dst);
        }
        target.style.setProperty("--map-offset-x", vrtX);
    }

    if (moveY != 0 || zoomD != 0) {
        if (parH > vrtH) {
            let dst = parH/2-vrtH/2;
            vrtY = Math.min(Math.max(-dst, vrtY + moveY), dst);
        } else {
            let dst = -(parH/2-vrtH/2);
            vrtY = Math.min(Math.max(-dst, vrtY + moveY), dst);
        }
        target.style.setProperty("--map-offset-y", vrtY);
    }
}

class HTMLTrackerMap extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        let map = this.shadowRoot.getElementById("map");
        this.addEventListener("wheel", event => {
            let target = this.shadowRoot.children[1];
            const delta = Math.sign(event.deltaY) / 50;
            mapContainBoundaries(target, this, 0, 0, delta);
            event.preventDefault();
            return false;
        });
        map.addEventListener("mousedown", mapMoveBegin);
        EventBus.on("location-mode-change", mode => this.mode = mode);
        EventBus.on("location-era-change", era => this.era = era);
        EventBus.onafter("global-update", event => {
            this.attributeChangedCallback("", "");
        });
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
                                let el = document.createElement('ootrt-poigossipstone');
                                el.style.left = buf.x;
                                el.style.top = buf.y;
                                el.ref = i;
                                this.appendChild(el);
                            }
                        });
                    }
                } else {
                    let data = GlobalData.get("locations");
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            if (i === "overworld") {
                                let buff = GlobalData.get("locations")["overworld"][`${this.mode}_v`];
                                if (!!buff) {
                                    Object.keys(buff).forEach(j => {
                                        let buf = buff[j];
                                        if (!buf.era || !this.era || this.era === buf.era) {
                                            if (!buf.mode || buf.mode != "scrubsanity" || TrackerLocalState.read("options", "scrubsanity", false)) {
                                                let el = document.createElement('ootrt-poilocation');
                                                el.style.left = buf.x;
                                                el.style.top = buf.y;
                                                el.ref = `overworld.${this.mode}.${j}`;
                                                this.appendChild(el);
                                            }
                                        }
                                    });
                                }
                            } else {
                                let el = document.createElement('ootrt-poiarea');
                                el.style.left = data[i].x;
                                el.style.top = data[i].y;
                                el.ref = i;
                                el.mode = this.mode;
                                this.appendChild(el);
                            }
                        });
                    }
                }
            }
        }
    }

}

customElements.define('ootrt-map', HTMLTrackerMap);