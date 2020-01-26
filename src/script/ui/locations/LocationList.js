import GlobalData from "/emcJS/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/selection/SwitchButton.js";
import StateStorage from "/script/storage/StateStorage.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import I18n from "/script/util/I18n.js";
import World from "/script/util/World.js";
import ListLogic from "/script/util/ListLogic.js";
import "./listitems/Button.js";
import "./listitems/Area.js";
import "./listitems/Entrance.js";
import "./listitems/Location.js";
import "./listitems/Gossipstone.js";
import "/script/ui/dungeonstate/DungeonType.js";

const SettingsStorage = new TrackerStorage('settings');

const EVENT_BINDER = new ManagedEventBinder("layout");
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
        #title > emc-switchbutton {
            width: 38px;
            height: 38px;
            padding: 4px;
            margin-left: 8px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
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
        #list {
            display: content;
        }
        ootrt-list-button {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            height: 45px;
            cursor: pointer;
            padding: 5px;
        }
        ootrt-list-button:hover,
        #list > *:hover {
            background-color: var(--dungeon-status-hover-color, #ffffff32);
        }
        ootrt-list-button.hidden,
        :host(:not([ref])) #back,
        :host([ref=""]) #back {
            display: none;
        }
    </style>
    <div id="title">
        <div id="title-text">${I18n.translate("hyrule")}</div>
        <ootrt-dungeontype value="v" id="location-version" readonly="true" ref="">
        </ootrt-dungeontype>
        <emc-switchbutton value="" id="location-era">
            <emc-option value="" style="background-image: url('images/world/era/both.svg')"></emc-option>
            <emc-option value="child" style="background-image: url('images/world/era/child.svg')"></emc-option>
            <emc-option value="adult" style="background-image: url('images/world/era/adult.svg')"></emc-option>
        </emc-switchbutton>
    </div>
    <div id="body">
        <ootrt-list-button id="back">(${I18n.translate("back")})</ootrt-list-button>
        <ootrt-list-button id="vanilla" class="hidden">${I18n.translate("vanilla")}</ootrt-list-button>
        <ootrt-list-button id="masterquest" class="hidden">${I18n.translate("masterquest")}</ootrt-list-button>
        <div id="list"></div>
    </div>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

class HTMLTrackerLocationList extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        let eraEl = this.shadowRoot.getElementById('location-era');
        eraEl.addEventListener("change", event => {
            let active_filter = MemoryStorage.get("active_filter", {});
            active_filter["filter.era"] = event.newValue;
            MemoryStorage.set("active_filter", active_filter);
            this.refresh();
            EventBus.trigger("filter", {
                ref: "filter.era",
                value: event.newValue
            });
        });
        this.shadowRoot.getElementById('back').addEventListener("click", event => {
            this.ref = ""
        });
        this.shadowRoot.getElementById('vanilla').addEventListener("click", event => {
            StateStorage.write(`dungeonTypes.${this.ref}`, 'v');
            EventBus.trigger("dungeontype", {
                name: this.ref,
                value: 'v'
            });
        });
        this.shadowRoot.getElementById('masterquest').addEventListener("click", event => {
            StateStorage.write(`dungeonTypes.${this.ref}`, 'mq');
            EventBus.trigger("dungeontype", {
                name: this.ref,
                value: 'mq'
            });
        });
        /* event bus */
        EVENT_BINDER.register("location_change", event => {
            this.ref = event.data.name;
        });
        EVENT_BINDER.register(["chest", "skulltula", "item", "logic"], event => {
            this.updateHeader();
        });
        EVENT_BINDER.register(["state", "settings", "randomizer_options"], event => {
            this.refresh();
        });
        EVENT_BINDER.register("dungeontype", event => {
            if (this.ref === event.data.name) {
                this.refresh();
            }
        });
        EVENT_BINDER.register("filter", event => {
            if (event.data.ref == "filter.era_active") {
                if (eraEl.value != event.data.value) {
                    eraEl.value = event.data.value;
                    this.refresh();
                }
            }
        });
    }

    connectedCallback() {
        this.refresh();
    }

    get ref() {
        return this.getAttribute('ref') || "";
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (name == "ref") {
                this.shadowRoot.getElementById("title-text").innerHTML = I18n.translate(newValue || "hyrule");
                this.shadowRoot.getElementById("location-version").ref = newValue;
                this.shadowRoot.getElementById('vanilla').ref = newValue;
                this.shadowRoot.getElementById('masterquest').ref = newValue;
            }
            this.refresh();
        }
    }

    refresh() {
        let cnt = this.shadowRoot.getElementById("list");
        let dType = this.shadowRoot.getElementById("location-version").value;
        let btn_vanilla = this.shadowRoot.getElementById('vanilla');
        let btn_masterquest = this.shadowRoot.getElementById('masterquest');
        cnt.innerHTML = "";
        if (dType == "n") {
            let data_v = GlobalData.get(`world_lists/${this.ref}/lists/v`);
            let data_m = GlobalData.get(`world_lists/${this.ref}/lists/mq`);
            let res_v = ListLogic.check(data_v.map(v=>v.id).filter(filterUnusedChecks));
            let res_m = ListLogic.check(data_m.map(v=>v.id).filter(filterUnusedChecks));
            btn_vanilla.className = VALUE_STATES[res_v.value];
            btn_masterquest.className = VALUE_STATES[res_m.value];
        } else {
            btn_vanilla.className = "hidden";
            btn_masterquest.className = "hidden";
            cnt.innerHTML = "";
            let data = GlobalData.get(`world_lists/${this.ref}/lists/${dType}`);
            if (!!data) {
                data.forEach(record => {
                    let loc = World.getLocation(record.id);
                    if (!!loc && loc.visible()) {
                        let el = loc.listItem;
                        cnt.append(el);
                    }
                });
            }
        }
        this.updateHeader();
    }

    async updateHeader() {
        if ((!this.ref || this.ref === "")) {
            this.shadowRoot.querySelector('#title').className = "";
        } else {
            let dType = this.shadowRoot.getElementById("location-version").value;
            let header_value = 1;
            if (dType == "n") {
                let data_v = GlobalData.get(`world_lists/${this.ref}/lists/v`);
                let data_m = GlobalData.get(`world_lists/${this.ref}/lists/mq`);
                let res_v = ListLogic.check(data_v.map(v=>v.id).filter(filterUnusedChecks));
                let res_m = ListLogic.check(data_m.map(v=>v.id).filter(filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    header_value = Math.min(res_v.value, res_m.value);
                } else {
                    header_value = Math.max(res_v.value, res_m.value);
                }
            } else {
                let data = GlobalData.get(`world_lists/${this.ref}/lists/${dType}`);
                let res = ListLogic.check(data.map(v=>v.id).filter(filterUnusedChecks));
                header_value = res.value;
            }
            this.shadowRoot.querySelector('#title').className = VALUE_STATES[header_value];
        }
    }
    
}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define('ootrt-locationlist', HTMLTrackerLocationList);

function filterUnusedChecks(check) {
    let loc = World.getLocation(check);
    return !!loc && loc.visible();
}