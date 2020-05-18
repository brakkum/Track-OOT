import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Dialog from "/emcJS/ui/Dialog.js";
import "/emcJS/ui/Tooltip.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/ListLogic.js";
import Logic from "/script/util/Logic.js";
import Language from "/script/util/Language.js";

const SettingsStorage = new IDBStorage('settings');

const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline-flex;
            width: 48px;
            height: 48px;
            box-sizing: border-box;
            transform: translate(-24px, -24px);
        }
        :host(:hover) {
            z-index: 1000;
        }
        #marker {
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            border: solid 4px black;
            border-radius: 25%;
            color: black;
            font-size: 30px;
            font-weight: bold;
            cursor: pointer;
        }
        #marker[data-state="opened"] {
            background-color: var(--location-status-opened-color, #000000);
        }
        #marker[data-state="available"] {
            background-color: var(--location-status-available-color, #000000);
        }
        #marker[data-state="unavailable"] {
            background-color: var(--location-status-unavailable-color, #000000);
        }
        #marker[data-state="possible"] {
            background-color: var(--location-status-possible-color, #000000);
        }
        #marker:hover {
            box-shadow: 0 0 2px 4px #67ffea;
        }
        #marker:hover + #tooltip {
            display: block;
        }
        #tooltip {
            padding: 5px 12px;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
            font-size: 30px;
        }
        .textarea {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 46px;
            word-break: break-word;
        }
        .textarea:empty {
            display: none;
        }
        #text {
            display: inline-flex;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
        }
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.1em;
            flex-shrink: 0;
            margin-left: 0.3em;
            border: 0.1em solid var(--navigation-background-color, #ffffff);
            border-radius: 0.3em;
        }
        #badge emc-icon {
            width: 30px;
            height: 30px;
        }
    </style>
    <div id="marker" class="unavailable"></div>
    <emc-tooltip position="top" id="tooltip">
        <div class="textarea">
            <div id="text"></div>
            <div id="badge">
                <emc-icon src="images/world/icons/entrance.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/world/era/none.svg"></emc-icon>
            </div>
        </div>
        <div id="value" class="textarea"></div>
    </emc-tooltip>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

export default class MapEntrance extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* mouse events */
        this.addEventListener("click", event => {
            if (!!this.value) {
                this.triggerGlobal("location_change", {
                    name: this.value
                });
            } else {
                entranceDialog(this.ref).then(r => {
                    this.value = r;
                    let ref = FileData.get(`world/${r}/access`);
                    let l = {};
                    l[ref] = {
                        "type": "value",
                        "el": this.access,
                        "category": "entrance"
                    }
                    //Logic.setLogic(l);
                    this.triggerGlobal("entrance", {
                        name: this.ref,
                        value: r
                    });
                });
            }
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.value = "";
            StateStorage.write(this.ref, "");
            this.triggerGlobal("entrance", {
                name: this.ref,
                value: ""
            });
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal("state", event => {
            let value = event.data[this.ref];
            if (typeof value == "undefined") {
                value = "";
            }
            this.value = value;
        });
        this.registerGlobal(["state_change", "settings", "randomizer_options", "logic", "filter"], event => {
            this.update()
        });
        this.registerGlobal("entrance", event => {
            if (this.ref === event.data.name && this.value !== event.data.value) {
                this.value = event.data.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.update();
    }

    async update() {
        if (!!this.value) {
            let dType = StateStorage.read(`dungeonTypes.${this.value}`, 'v'); // TODO
            if (dType == "n") {
                let data_v = FileData.get(`world_lists/${this.value}/lists/v`);
                let data_m = FileData.get(`world_lists/${this.value}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
                this.shadowRoot.getElementById("marker").innerHTML = "";
            } else {
                let data = FileData.get(`world_lists/${this.value}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[res.value];
                if (res.value > 1) {
                    this.shadowRoot.getElementById("marker").innerHTML = res.reachable;
                } else {
                    this.shadowRoot.getElementById("marker").innerHTML = "";
                }
            }
        } else if (!!this.access && !!Logic.getValue(this.access)) {
            this.shadowRoot.getElementById("marker").dataset.state = "available";
            this.shadowRoot.getElementById("marker").innerHTML = "";
        } else {
            this.shadowRoot.getElementById("marker").dataset.state = "unavailable";
            this.shadowRoot.getElementById("marker").innerHTML = "";
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    get left() {
        return this.getAttribute('left');
    }

    set left(val) {
        this.setAttribute('left', val);
    }

    get top() {
        return this.getAttribute('top');
    }

    set top(val) {
        this.setAttribute('top', val);
    }

    get tooltip() {
        return this.getAttribute('tooltip');
    }

    set tooltip(val) {
        this.setAttribute('tooltip', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'access', 'left', 'top', 'tooltip'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(newValue);
                    this.value = StateStorage.read(newValue, "");
                    this.update();
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById("value").innerHTML = Language.translate(newValue);
                    } else {
                        this.shadowRoot.getElementById("value").innerHTML = "";
                    }
                    this.update();
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    this.update();
                }
            break;
            case 'top':
            case 'left':
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                }
            break;
            case 'tooltip':
                if (oldValue != newValue) {
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    tooltip.position = newValue;
                }
            break;
        }
    }

    setFilterData(data) {
        let el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/world/era/adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/world/era/child.svg";
        } else {
            el_era.src = "images/world/era/both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/world/time/night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/world/time/day.svg";
        } else {
            el_time.src = "images/world/time/always.svg";
        }
    }

}

customElements.define('ootrt-marker-entrance', MapEntrance);

function entranceDialog(ref) {
    return new Promise(resolve => {
        let value = StateStorage.read(ref, "");
        let world = FileData.get('world');
        let type = world[ref].type;
    
        let loc = document.createElement('label');
        loc.style.display = "flex";
        loc.style.justifyContent = "space-between";
        loc.style.alignItems = "center";
        loc.style.padding = "5px";
        loc.innerHTML = Language.translate("location");
        let slt = document.createElement("select");

        let unbound = new Set();
        for (let i in world) {
            let entry = world[i];
            if (entry.category == "area" && entry.type == type) {
                unbound.add(i);
            }
        }
        for (let i in world) {
            let entry = world[i];
            if (entry.category == "entrance" && entry.type == type) {
                let bound = StateStorage.read(i, "");
                if (i != ref && !!bound) {
                    unbound.delete(bound);
                }
            }
        }
        unbound = Array.from(unbound);
        
        for (let i of unbound) {
            slt.append(createOption(i, Language.translate(i)));
        }
        slt.style.width = "200px";
        slt.value = value;
        loc.append(slt);
        
        let d = new Dialog({title: Language.translate(ref), submit: true, cancel: true});
        d.onsubmit = function(ref, result) {
            if (!!result) {
                let res = slt.value;
                StateStorage.write(ref, res);
                resolve(res);
            } else {
                resolve(false);
            }
        }.bind(this, ref);
        d.append(loc);
        d.show();
    });
}

function createOption(value, content) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}