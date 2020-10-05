import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/input/SwitchButton.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Language from "/script/util/Language.js";
import World from "/script/util/World.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import "./listitems/Button.js";
import "./listitems/Area.js";
import "./listitems/Exit.js";
import "./listitems/Location.js";
import "./listitems/Gossipstone.js";
import "/script/ui/dungeonstate/DungeonType.js";
import "/script/ui/FilterMenu.js";

const SettingsStorage = new IDBStorage('settings');

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
            -moz-user-select: none;
            user-select: none;
        }
        #title-text {
            display: block;
            flex: 1;
            font-size: .8em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #title > .button {
            width: 38px;
            height: 38px;
            padding: 4px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #title > .button {
            margin-left: 8px;
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
        #hint {
            margin-left: 5px;
        }
        #hint img {
            width: 25px;
            height: 25px;
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
        <div id="title-text">${Language.translate("hyrule")}</div>
        <div id="hint"></div>
        <ootrt-dungeontype id="location-version" class="button" ref="" value="v" readonly="true">
        </ootrt-dungeontype>
        <ootrt-filtermenu class="button">
        </ootrt-filtermenu>
    </div>
    <div id="body">
        <ootrt-list-button id="back">(${Language.translate("back")})</ootrt-list-button>
        <ootrt-list-button id="vanilla" class="hidden">${Language.translate("vanilla")}</ootrt-list-button>
        <ootrt-list-button id="masterquest" class="hidden">${Language.translate("masterquest")}</ootrt-list-button>
        <div id="list"></div>
    </div>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

class HTMLTrackerLocationList extends EventBusSubsetMixin(Panel) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        this.shadowRoot.getElementById('back').addEventListener("click", event => {
            this.ref = ""
        });
        this.shadowRoot.getElementById('vanilla').addEventListener("click", event => {
            StateStorage.write(`dungeonTypes.${this.ref}`, 'v');
            this.triggerGlobal("dungeontype", {
                name: this.ref,
                value: 'v'
            });
        });
        this.shadowRoot.getElementById('masterquest').addEventListener("click", event => {
            StateStorage.write(`dungeonTypes.${this.ref}`, 'mq');
            this.triggerGlobal("dungeontype", {
                name: this.ref,
                value: 'mq'
            });
        });
        /* event bus */
        this.registerGlobal("location_change", event => {
            this.ref = event.data.name;
        });
        this.registerGlobal(["location_chest", "location_skulltula", "location_gossipstone", "item", "logic"], event => {
            this.updateHeader();
        });
        this.registerGlobal(["state", "settings", "randomizer_options", "filter"], event => {
            this.refresh();
        });
        this.registerGlobal("dungeontype", event => {
            if (this.ref === event.data.name) {
                this.shadowRoot.getElementById("location-version").value = event.data.value;
                this.refresh();
            }
        });
        this.registerGlobal("statechange_area_hint", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                this.hint = data.newValue;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.refresh();
    }

    get ref() {
        return this.getAttribute('ref') || "";
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get hint() {
        return this.getAttribute('hint');
    }

    set hint(val) {
        this.setAttribute('hint', val);
    }

    static get observedAttributes() {
        return ['ref', 'hint'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("title-text").innerHTML = Language.translate(newValue || "hyrule");
                    this.shadowRoot.getElementById("location-version").ref = newValue;
                    this.shadowRoot.getElementById('vanilla').ref = newValue;
                    this.shadowRoot.getElementById('masterquest').ref = newValue;
                    this.hint = StateStorage.readExtra("area_hint", newValue, "");
                    this.refresh();
                }
            break;
            case 'hint':
                if (oldValue != newValue) {
                    let hintEl = this.shadowRoot.getElementById("hint");
                    hintEl.innerHTML = "";
                    if (!!newValue && newValue != "") {
                        let el_icon = document.createElement("img");
                        el_icon.src = `images/icons/area_${newValue}.svg`;
                        hintEl.append(el_icon);
                    }
                }
            break;
        }
    }

    refresh() {
        let cnt = this.shadowRoot.getElementById("list");
        let dType = this.shadowRoot.getElementById("location-version").value;
        let btn_vanilla = this.shadowRoot.getElementById('vanilla');
        let btn_masterquest = this.shadowRoot.getElementById('masterquest');
        cnt.innerHTML = "";
        let data = FileData.get(`world_lists/${this.ref}`);
        if (!!data) {
            if (data.lists.mq == null) {
                dType = "v";
            }
            if (dType == "n") {
                let data_v = data.lists.v;
                let data_m = data.lists.mq;
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                btn_vanilla.className = VALUE_STATES[res_v.value];
                btn_masterquest.className = VALUE_STATES[res_m.value];
            } else {
                btn_vanilla.className = "hidden";
                btn_masterquest.className = "hidden";
                data.lists[dType].forEach(record => {
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
                let data_v = FileData.get(`world_lists/${this.ref}/lists/v`);
                let data_m = FileData.get(`world_lists/${this.ref}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    header_value = Math.min(res_v.value, res_m.value);
                } else {
                    header_value = Math.max(res_v.value, res_m.value);
                }
            } else {
                let data = FileData.get(`world_lists/${this.ref}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                header_value = res.value;
            }
            this.shadowRoot.querySelector('#title').className = VALUE_STATES[header_value];
        }
    }
    
}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define('ootrt-locationlist', HTMLTrackerLocationList);