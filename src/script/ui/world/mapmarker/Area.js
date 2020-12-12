import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/overlay/Tooltip.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import Language from "/script/util/Language.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const SettingsStorage = new IDBStorage('settings');

const TPL = new Template(`
<div id="marker" class="unavailable"></div>
<emc-tooltip position="top" id="tooltip">
    <div class="textarea">
        <div id="entrances"></div>
        <div id="text"></div>
        <div id="hint"></div>
        <div id="badge">
            <emc-icon src="images/icons/area.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_both.svg"></emc-icon>
        </div>
    </div>
</emc-tooltip>
`);

const STYLE = new GlobalStyle(`
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
#marker[data-entrances="true"]:after {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 10px;
    height: 10px;
    background-color: var(--location-status-available-color, #000000);
    border: solid 4px black;
    border-radius: 50%;
    content: " ";
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
#hint {
    margin-left: 5px;
}
#hint:empty {
    display: none;
}
#hint img {
    width: 25px;
    height: 25px;
}
#entrances {
    margin-right: 5px;
}
#entrances:empty {
    display: none;
}
#entrances img {
    width: 25px;
    height: 25px;
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
`);

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check All</div>
        <div id="menu-uncheck" class="item">Uncheck All</div>
        <div class="splitter"></div>
        <div id="menu-setwoth" class="item">Set WOTH</div>
        <div id="menu-setbarren" class="item">Set Barren</div>
        <div id="menu-clearhint" class="item">Clear Hint</div>
    </emc-contextmenu>
`);

function setAllListEntries(list, value = true) {
    if (!!list && Array.isArray(list)) {
        for (const entry of list) {
            const category = entry.category;
            const id = entry.id;
            if (category == "location") {
                StateStorage.write(`${category}/${id}`, value);
            } else if (category == "subarea") {
                const subarea = FileData.get(`world/subarea/${id}/list`);
                setAllListEntries(subarea, value);
            } else if (category == "subexit") {
                const subexit = FileData.get(`world/marker/subexit/${id}`);
                const bound = StateStorage.readExtra("exits", subexit.access);
                if (!bound) {
                    continue;
                }
                let entrance = FileData.get(`world/exit/${bound}`);
                if (entrance == null) {
                    entrance = FileData.get(`world/exit/${bound.split(" -> ").reverse().join(" -> ")}`)
                }
                if (entrance != null) {
                    const subarea = FileData.get(`world/${entrance.area}/list`);
                    setAllListEntries(subarea, value);
                }
            } else {
                Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "Area");
            }
        }
    }
}

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
        STYLE.apply(this.shadowRoot);
        /* --- */

        /* context menu */
        const mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        const mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], true);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], false);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setwoth").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "woth");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setbarren").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "barren");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-clearhint").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "");
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            this.triggerGlobal("location_change", {
                name: this.ref
            });
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(["state", "statechange", "settings", "randomizer_options", "logic", "filter"], event => {
            // update exit
            this.hint = StateStorage.readExtra("area_hint", this.ref, "");
            // update state
            this.update()
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
        //this.registerGlobal("dungeontype", dungeonTypeUpdate.bind(this));
        
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        // update exit
        this.hint = StateStorage.readExtra("area_hint", this.ref, "");
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
    }

    async update() {
        if (this.ref) {
            const dType = StateStorage.readExtra("dungeontype", this.ref, 'v'); // TODO
            if (dType == "n") {
                const data_v = FileData.get(`world/${this.ref}/lists/v`);
                const data_m = FileData.get(`world/${this.ref}/lists/mq`);
                const res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                const res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
                this.shadowRoot.getElementById("marker").innerHTML = "";
                this.setEntrances(res_v.entrances || res_v.entrances);
            } else {
                const data = FileData.get(`world/${this.ref}/lists/${dType}`);
                const res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("marker").dataset.state = VALUE_STATES[res.value];
                if (res.value > 1) {
                    this.shadowRoot.getElementById("marker").innerHTML = res.reachable;
                } else {
                    this.shadowRoot.getElementById("marker").innerHTML = "";
                }
                this.setEntrances(res.entrances);
            }
        } else {
            this.shadowRoot.getElementById("marker").dataset.state = "unavailable";
            this.shadowRoot.getElementById("marker").innerHTML = "";
        }
    }

    setEntrances(active) {
        const entrances = this.shadowRoot.getElementById("entrances");
        entrances.innerHTML = "";
        if (active) {
            const el_icon = document.createElement("img");
            el_icon.src = `images/icons/entrance.svg`;
            entrances.append(el_icon);
            this.shadowRoot.getElementById("marker").dataset.entrances = "true";
        } else {
            this.shadowRoot.getElementById("marker").dataset.entrances = "false";
        }
    }

    get ref() {
        return this.getAttribute('ref');
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
        return ['ref', 'hint', 'left', 'top', 'tooltip'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.update();
                    const txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(newValue);
                    this.hint = StateStorage.readExtra("area_hint", newValue, "");
                }
                break;
            case 'hint':
                if (oldValue != newValue) {
                    const hintEl = this.shadowRoot.getElementById("hint");
                    hintEl.innerHTML = "";
                    if (!!newValue && newValue != "") {
                        const el_icon = document.createElement("img");
                        el_icon.src = `images/icons/area_${newValue}.svg`;
                        hintEl.append(el_icon);
                    }
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
                    const tooltip = this.shadowRoot.getElementById("tooltip");
                    tooltip.position = newValue;
                }
                break;
        }
    }

    setFilterData(data) {
        const el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        const el_time = this.shadowRoot.getElementById("badge-time");
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
