import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Panel from "/deepJS/ui/layout/Panel.js";
import "/deepJS/ui/selection/SwitchButton.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";
import "../dungeonstate/DungeonType.js";
import "./listitems/Chest.js";
import "./listitems/Skulltula.js";
import "./listitems/Gossipstone.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            cursor: default;
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
        #location-era {
            width: 34px;
            height: 34px;
            padding: 2px;
            margin-left: 5px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }
        #body > * {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            min-height: 30px;
            width: 100%;
            padding: 2px;
            line-height: 1em;
            cursor: pointer;
        }
        #body > *:hover {
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
    </div>
    <div id="body">
        
    </div>
`);

const LOCATION_ELEMENTS = new Map();

function generateLocations() {
    let data = GlobalData.get("world/locations");
    for (let i in data) {
        let el;
        switch (data[i].type) {
            default: continue;
            case "chest":
            case "cow":
            case "scrub":
            case "bean":
                el = document.createElement('ootrt-listchest');
                break;
            case "skulltula":
                el = document.createElement('ootrt-listskulltula');
                break;
            case "gossipstone":
                el = document.createElement('ootrt-listgossipstone');
                break;
        }
        el.ref = i;
        LOCATION_ELEMENTS.set(i, el);
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

async function locationUpdate(event) {
    if ((!this.ref || this.ref === "")) {
        this.shadowRoot.querySelector('#title').className = "";
        let ch = Array.from(this.shadowRoot.getElementById("body").children);
        ch.forEach(async c => {
            c.className = translate(await Logic.checkLogicList(c.dataset.ref))
        });
    } else {
        let data = GlobalData.get(`world/areas/${this.ref}`);
        /*let dType = StateStorage.read(`dungeonTypes.${this.ref || "overworld"}`, data.hasmq ? "n" : "v");
        if (dType === "n") {
            let ch = Array.from(this.shadowRoot.getElementById("body").children);
            ch.forEach(async c => {
                if (!c.dataset.ref || c.dataset.ref === "") return;
                c.className = translate(await Logic.checkLogicList(this.mode, this.ref, c.dataset.ref));
            });
        }*/
        this.shadowRoot.querySelector('#title').className = translate(await Logic.checkLogicList(this.ref || "overworld"));
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
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        this.shadowRoot.getElementById('location-era').addEventListener("change", event => {
            this.era = event.newValue;
            MemoryStorage.set("filter.era_active", this.era);
            EventBus.trigger("filter", {
                ref: "filter.era_active",
                value: this.era
            });
        });
        /* event bus */
        EVENT_BINDER.register("location_change", event => this.ref = event.data.name);
        EVENT_BINDER.register(["chest", "skulltula", "item", "state", "settings", "logic"], locationUpdate.bind(this));
        EVENT_BINDER.register("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_BINDER.register("filter", event => {
            if (event.data.ref == "filter.era_active") {
                this.era = event.data.value;
                this.shadowRoot.getElementById('location-era').value = this.era;
            }
        });
    }

    connectedCallback() {
        this.setAttribute("mode", "chests");
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
            
            if (!this.ref || this.ref === "") {
                let data = GlobalData.get("world/areas");
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
                let data = GlobalData.get(`world/areas/${this.ref}`);
                /*let dType = StateStorage.read(`dungeonTypes.${this.ref}`, data.hasmq ? "n" : "v");
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
                } else {  */  
                    // if (!!this.mode && this.mode !== "") {
                        if (!!data.locations) {
                            for (let i = 0; i < data.locations.length; ++i) {
                                cnt.append(LOCATION_ELEMENTS.get(data.locations[i]));
                            }
                        }
                    //  }
                // }
            }

            locationUpdate.apply(this);
        }
    }

}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define('ootrt-locationlist', HTMLTrackerLocationList);