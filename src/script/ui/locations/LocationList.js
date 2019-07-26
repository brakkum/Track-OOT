import GlobalData from "/deepJS/storage/GlobalData.js";
import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Panel from "/deepJS/ui/layout/Panel.js";
import "/deepJS/ui/selection/SwitchButton.js";
import TrackerLocalState from "/script/util/LocalState.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";
import "../dungeonstate/DungeonType.js";
import "./LocationChest.js";
import "./LocationSkulltula.js";
import "./Gossipstone.js";

const EVENT_LISTENERS = new WeakMap();
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            flex-direction: column;
            min-width: 100%;
            min-height: 100%;
            width: 300px;
            height: 300px;
        }
        #title {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 10px;
            font-size: 1.5em;
            line-height: 1em;
            border-bottom: solid 1px white;
        }
        #title-text {
            display: flex;
            flex: 1;
            justify-content: flex-start;
            align-items: center;
        }
        #location-mode,
        #location-era {
            width: 30px;
            height: 30px;
            margin-left: 5px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }
        #body > div,
        #body > ootrt-listlocation,
        #body > ootrt-listgossipstone {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            min-height: 30px;
            width: 100%;
            padding: 2px;
            font-size: 1.2em;
            line-height: 1em;
        }
        #body > div:hover,
        #body > ootrt-listlocation:hover,
        #body > ootrt-listgossipstone:hover {
            background-color: var(--dungeon-status-hover-color, #ffffff32);
        }
        .opened {
            color: var(--location-status-opened-color, #000000);
        }
        .available {
            color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            color: var(--location-status-possible-color, #000000);
        }
    </style>
    <div id="title">
        <div id="title-text"></div>
        <ootrt-dungeontype id="location-type">
        </ootrt-dungeontype>
        <deep-switchbutton value="" id="location-era">
            <deep-option value="" style="background-image: url('images/era_both.svg')"></deep-option>
            <deep-option value="child" style="background-image: url('images/era_child.svg')"></deep-option>
            <deep-option value="adult" style="background-image: url('images/era_adult.svg')"></deep-option>
        </deep-switchbutton>
        <deep-switchbutton value="chests" id="location-mode">
            <deep-option value="chests" style="background-image: url('images/chest.svg')"></deep-option>
            <deep-option value="skulltulas" style="background-image: url('images/skulltula.svg')"></deep-option>
            <deep-option value="gossipstones" style="background-image: url('images/gossips.svg')"></deep-option>
        </deep-switchbutton>
    </div>
    <div id="body">
        
    </div>
`);

const LOCATION_ELEMENTS = new Map();

function generateLocations() {
    let data = GlobalData.get("locations");
    if (!!data.overworld && !!data.overworld.gossipstones_v) {
        for (let i in data.overworld.gossipstones_v) {
            let el = document.createElement('ootrt-listgossipstone');
            el.ref = i;
            LOCATION_ELEMENTS.set(`G:${i}`, el);
        }
    }
    for (let i in data) {
        if (!!data[i].chests_v) {
            for (let j in data[i].chests_v) {
                let el = document.createElement('ootrt-listlocationchest');
                el.ref = `${i}.chests_v.${j}`;
                LOCATION_ELEMENTS.set(`${i}.chests_v.${j}`, el);
            }
        }
        if (!!data[i].skulltulas_v) {
            for (let j in data[i].skulltulas_v) {
                let el = document.createElement('ootrt-listlocationskulltula');
                el.ref = `${i}.skulltulas_v.${j}`;
                LOCATION_ELEMENTS.set(`${i}.skulltulas_v.${j}`, el);
            }
        }
        if (!!data[i].chests_mq) {
            for (let j in data[i].chests_mq) {
                let el = document.createElement('ootrt-listlocationchest');
                el.ref = `${i}.chests_mq.${j}`;
                LOCATION_ELEMENTS.set(`${i}.chests_mq.${j}`, el);
            }
        }
        if (!!data[i].skulltulas_mq) {
            for (let j in data[i].skulltulas_mq) {
                let el = document.createElement('ootrt-listlocationskulltula');
                el.ref = `${i}.skulltulas_mq.${j}`;
                LOCATION_ELEMENTS.set(`${i}.skulltulas_mq.${j}`, el);
            }
        }
    }
}

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

function locationUpdate(event) {
    if ((!this.ref || this.ref === "") && this.mode != "gossipstones") {
        this.shadowRoot.querySelector('#title').className = "";
        let ch = Array.from(this.shadowRoot.getElementById("body").children);
        ch.forEach(c => {
            c.className = translate(Logic.checkLogicList(this.mode, c.dataset.ref))
        });
    } else {
        if (this.mode == "gossipstones") {
            this.shadowRoot.querySelector('#title').className = "";
        } else {
            let data = GlobalData.get("locations")[this.ref || "overworld"];
            let dType = TrackerLocalState.read("dungeonTypes", this.ref || "overworld", data.hasmq ? "n" : "v");
            if (dType === "n") {
                let ch = Array.from(this.shadowRoot.getElementById("body").children);
                ch.forEach(c => {
                    if (!c.dataset.ref || c.dataset.ref === "") return;
                    c.className = translate(Logic.checkLogicList(this.mode, this.ref, c.dataset.ref));
                });
            }
            this.shadowRoot.querySelector('#title').className = translate(Logic.checkLogicList(this.mode, this.ref || "overworld"));
        }
    }
}

function dungeonTypeUpdate(event) {
    if (this.ref === event.data.name) {
        this.attributeChangedCallback("", "");
    }
}

class HTMLTrackerLocationList extends Panel {

    constructor() {
        super();
        generateLocations();
<<<<<<< HEAD:src/script/ui/locations/LocationList.mjs
        EventBus.on("location-change", event => this.ref = event.data.name);
        EventBus.on(["dungeon-type-update", "net:dungeon-type-update"], dungeonTypeUppdate.bind(this));
        EventBus.on(["location-update", "net:location-update"], locationUpdate.bind(this));
        EventBus.on(["item-update", "net:item-update"], locationUpdate.bind(this));
        EventBus.on("force-location-update", locationUpdate.bind(this));
        EventBus.on("logic", locationUpdate.bind(this));
=======
>>>>>>> feature/layout:src/script/ui/locations/LocationList.js
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        this.shadowRoot.getElementById('location-mode').addEventListener("change", event => {
            this.mode = event.newValue;
            EventBus.trigger("location_mode", {
                value: this.mode
            });
        });
        this.shadowRoot.getElementById('location-era').addEventListener("change", event => {
            this.era = event.newValue;
            MemoryStorage.set("active_filter", "filter_era_active", this.era);
            EventBus.trigger("location_era", {
                value: this.era
            });
            EventBus.fire("filter", {
                ref: "filter_era_active",
                value: this.era
            });
        });
        /* event bus */
        let events = new Map();
        events.set("location_change", event => this.ref = event.data.name);
        events.set(["chest", "skulltula", "item", "state", "settings"], locationUpdate.bind(this));
        events.set("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_LISTENERS.set(this, events);
    }

    connectedCallback() {
        this.setAttribute("mode", "chests");
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.register(key, value);
        });
    }

    disconnectedCallback() {
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.unregister(key, value);
        });
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
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
        return ['ref', 'mode', 'era'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            let cnt = this.shadowRoot.getElementById("body");
            let locationType = this.shadowRoot.getElementById("location-type");
            cnt.innerHTML = "";
            if (this.mode === "gossipstones") {
                locationType.ref = "";
                this.shadowRoot.getElementById("title-text").innerHTML = I18n.translate("hyrule");
                let data = GlobalData.get("locations")["overworld"][`gossipstones_v`];
                if (!!data) {
                    Object.keys(data).forEach(i => {
                        let buf = data[i];
                        if (!buf.era || !this.era || this.era === buf.era) {
                            let el = LOCATION_ELEMENTS.get(`G:${i}`);
                            cnt.append(el);
                        }
                    });
                }
            } else {
                let data = GlobalData.get("locations");
                if (!this.ref || this.ref === "") {
                    locationType.ref = "";
                    this.shadowRoot.getElementById("title-text").innerHTML = I18n.translate("hyrule");
                    this.shadowRoot.getElementById("title").className = "";
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            let el = document.createElement('div');
                            el.dataset.ref = i;
                            el.addEventListener("click", () => this.ref = i);
                            el.innerHTML = I18n.translate(i);
                            cnt.append(el);
                        });
                    }
                } else {
                    this.shadowRoot.getElementById("title-text").innerHTML = I18n.translate(this.ref);
                    let bck = document.createElement('div');
                    bck.innerHTML = `(${I18n.translate("back")})`;
                    bck.addEventListener("click", () => this.ref = "");
                    cnt.append(bck);
                    data = GlobalData.get("locations")[this.ref];
                    let dType = TrackerLocalState.read("dungeonTypes", this.ref, data.hasmq ? "n" : "v");
                    if (data.hasmq) {
                        locationType.ref = this.ref;
                    } else {
                        locationType.ref = "";
                    }
                    if (dType === "n") {
                        let v = document.createElement('div');
                        v.dataset.ref = "v";
                        v.innerHTML = I18n.translate("vanilla");
                        v.addEventListener("click", () => {
                            locationType.value = "v";
                        });
                        cnt.append(v);
                        let mq = document.createElement('div');
                        mq.dataset.ref = "mq";
                        mq.innerHTML = I18n.translate("masterquest");
                        mq.addEventListener("click", () => {
                            locationType.value = "mq";
                        });
                        cnt.append(mq);
                    } else {    
                        if (!!this.mode && this.mode !== "") {
                            data = data[`${this.mode}_${dType}`];
                            if (!!data) {
                                Object.keys(data).forEach(i => {
                                    let buf = data[i];
                                    if (!buf.era || !this.era || this.era === buf.era) {
                                        if (!buf.mode || TrackerLocalState.read("options", buf.mode, false)) {
                                            let el = LOCATION_ELEMENTS.get(`${this.ref}.${this.mode}_${dType}.${i}`);
                                            cnt.append(el);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
            locationUpdate.apply(this);
        }
    }

}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define('ootrt-locationlist', HTMLTrackerLocationList);