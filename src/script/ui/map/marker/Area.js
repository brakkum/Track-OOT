import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/Tooltip.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/ListLogic.js";
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
            border: solid 4px black;
            border-radius: 25%;
            color: black;
            background-color: #ffffff;
            font-size: 1em;
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
            display: flex;
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
                <emc-icon src="images/icons/area.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/icons/era_both.svg"></emc-icon>
            </div>
        </div>
    </emc-tooltip>
`);

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check All</div>
        <div id="menu-uncheck" class="item">Uncheck All</div>
    </emc-contextmenu>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const MNU_CTX = new WeakMap();

export default class MapArea extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* context menu */
        let mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        let mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            let data = FileData.get(`world_lists/${this.ref}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, true);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, true);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            let data = FileData.get(`world_lists/${this.ref}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, false);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, false);
                }
            }
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            this.triggerGlobal("location_change", {
                name: this.ref
            });
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY);
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(["state", "statechange", "settings", "randomizer_options", "logic", "filter"], event => {
            this.update()
        });
        //this.registerGlobal("dungeontype", dungeonTypeUpdate.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this.parentElement;
        if (el != null) {
            el = el.parentElement;
            if (el != null) {
                el.append(MNU_CTX.get(this));
            }
        }
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
    }

    async update() {
        if (!!this.ref) {
            let dType = StateStorage.read(`dungeonTypes.${this.ref}`, 'v'); // TODO
            if (dType == "n") {
                let data_v = FileData.get(`world_lists/${this.ref}/lists/v`);
                let data_m = FileData.get(`world_lists/${this.ref}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
                this.shadowRoot.getElementById("marker").innerHTML = "";
            } else {
                let data = FileData.get(`world_lists/${this.ref}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[res.value];
                if (res.value > 1) {
                    this.shadowRoot.getElementById("marker").innerHTML = res.reachable;
                } else {
                    this.shadowRoot.getElementById("marker").innerHTML = "";
                }
            }
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
        return ['ref', 'left', 'top', 'tooltip'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.update();
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(this.ref);
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
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/icons/time_night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/icons/time_day.svg";
        } else {
            el_time.src = "images/icons/time_always.svg";
        }
    }

}

customElements.define('ootrt-marker-area', MapArea);